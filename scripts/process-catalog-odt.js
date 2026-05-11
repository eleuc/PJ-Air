const fs = require('fs');
const path = require('path');

// Locate existing adm-zip package from backend
const admZipPath = path.join(__dirname, '..', 'backend', 'node_modules', 'adm-zip');
if (!fs.existsSync(admZipPath)) {
  console.error(`Error: adm-zip not found at ${admZipPath}. Please ensure backend dependencies are installed.`);
  process.exit(1);
}
const AdmZip = require(admZipPath);

const odtPath = path.join(__dirname, '..', 'recursos', '1_BAKERY WHOLESALE-compressed-odf.odt');
const extractionDir = path.join(__dirname, '..', 'recursos', 'extraction');
const tmpOdtDir = path.join(extractionDir, 'tmp-odt');

if (!fs.existsSync(odtPath)) {
  console.error(`Error: Catalog ODT file not found at ${odtPath}`);
  process.exit(1);
}

// Ensure output directories exist
[extractionDir, tmpOdtDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log('--------------------------------------------------');
  console.log('🚀 JHOANES BAKERY ODT CATALOG PARSER - EXTRACTION');
console.log('--------------------------------------------------');

console.log(`1. Opening ODT catalog: ${path.basename(odtPath)}`);
const zip = new AdmZip(odtPath);

console.log(`2. Extracting content.xml to ${tmpOdtDir}...`);
zip.extractEntryTo('content.xml', tmpOdtDir, false, true);

console.log(`3. Extracting styles.xml to ${tmpOdtDir}...`);
zip.extractEntryTo('styles.xml', tmpOdtDir, false, true);

const contentPath = path.join(tmpOdtDir, 'content.xml');
const stylesPath = path.join(tmpOdtDir, 'styles.xml');

if (fs.existsSync(contentPath) && fs.existsSync(stylesPath)) {
  console.log('✨ Extraction successful!');
  console.log(`   content.xml size: ${Math.round(fs.statSync(contentPath).size / 1024)} KB`);
  console.log(`   styles.xml size: ${Math.round(fs.statSync(stylesPath).size / 1024)} KB`);
  
  const content = fs.readFileSync(contentPath, 'utf8');
  const stylesContent = fs.readFileSync(stylesPath, 'utf8');
  
  // 1. Build Style Inheritance & Master Page Maps
  const styleParents = {};
  const styleMasterPages = {};
  
  function parseStyles(xml) {
    const styleBlocks = xml.match(/<style:style[^>]+>/gi) || [];
    styleBlocks.forEach(block => {
      const nameMatch = block.match(/style:name="([^"]+)"/i);
      if (!nameMatch) return;
      const styleName = nameMatch[1];
      
      const parentMatch = block.match(/style:parent-style-name="([^"]+)"/i);
      if (parentMatch) {
        styleParents[styleName] = parentMatch[1];
      }
      
      const masterMatch = block.match(/style:master-page-name="([^"]+)"/i);
      if (masterMatch) {
        styleMasterPages[styleName] = masterMatch[1];
      }
    });
  }
  
  parseStyles(content);
  parseStyles(stylesContent);
  
  // Recursive resolver for page number based on style inheritance
  const resolvedPageCache = {};
  function getPageForStyle(styleName) {
    if (!styleName) return null;
    if (resolvedPageCache[styleName] !== undefined) return resolvedPageCache[styleName];
    
    let current = styleName;
    const visited = new Set();
    while (current && !visited.has(current)) {
      visited.add(current);
      if (styleMasterPages[current]) {
        const masterName = styleMasterPages[current];
        let pageNo = 1;
        if (masterName.startsWith('Converted')) {
          pageNo = parseInt(masterName.replace('Converted', ''), 10) + 1;
        }
        resolvedPageCache[styleName] = pageNo;
        return pageNo;
      }
      current = styleParents[current];
    }
    
    resolvedPageCache[styleName] = null;
    return null;
  }
  
  // 2. Extract sequential body elements
  const bodyIndex = content.indexOf('<office:body');
  const textIndex = content.indexOf('<office:text');
  
  const bodyMatch = content.match(/<office:body[^>]*>([\s\S]*?)<\/office:body>/i);
  const bodyText = bodyMatch ? bodyMatch[1] : '';
  
  const textMatch = bodyText.match(/<office:text[^>]*>([\s\S]*?)<\/office:text>/i);
  let officeTextContent = textMatch ? textMatch[1] : bodyText;
  
  // Clean only nested paragraph tags inside drawing elements to prevent greedy paragraph-matching bugs,
  // while preserving the draw:image tags so we can extract individual product image paths!
  let prevLen;
  do {
    prevLen = officeTextContent.length;
    officeTextContent = officeTextContent.replace(/<draw:(frame|custom-shape|g)\b[^>]*>([\s\S]*?)<\/draw:\1>/gi, (match) => {
      return match.replace(/<text:(p|h)\b[^>]*>([\s\S]*?)<\/text:\1>/gi, '$2')
                  .replace(/<text:(p|h)\b[^>]*\/>/gi, '');
    });
  } while (officeTextContent.length !== prevLen);
  
  // Expand self-closing text:p and text:h tags to preserve style-based page-break triggers
  officeTextContent = officeTextContent.replace(/<text:(p|h)\b([^>]*)\/>/gi, '<text:$1$2></text:$1>');
  
  const elementRegex = /<(text:p|text:h)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  const elements = [];
  let currentPage = 1;
  
  while ((m = elementRegex.exec(officeTextContent)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const innerXml = m[3];
    
    const styleMatch = attrs.match(/text:style-name="([^"]+)"/i);
    const styleName = styleMatch ? styleMatch[1] : null;
    
    const resolvedPage = getPageForStyle(styleName);
    if (resolvedPage !== null) {
      currentPage = resolvedPage;
    }
    
    // Extract any embedded product image reference, filtering out tiny decorative icons/separators
    let elImagePath = null;
    let rawImageHref = null;
    let frameWidth = null;
    let frameHeight = null;
    let frameX = null;
    let frameY = null;
    let isTiny = false;
    const imgMatch = innerXml.match(/<draw:image[^>]+xlink:href="([^"]+)"/i);
    if (imgMatch) {
      rawImageHref = imgMatch[1];
      const frameMatch = innerXml.match(/<draw:frame\b([^>]+)>/i);
      if (frameMatch) {
        const frameAttrs = frameMatch[1];
        const widthMatch = frameAttrs.match(/svg:width="([\d.]+)(cm|in|mm|px)"/i);
        const heightMatch = frameAttrs.match(/svg:height="([\d.]+)(cm|in|mm|px)"/i);
        const xMatch = frameAttrs.match(/svg:x="([\d.]+)(cm|in|mm|px)"/i);
        const yMatch = frameAttrs.match(/svg:y="([\d.]+)(cm|in|mm|px)"/i);
        
        if (widthMatch) frameWidth = widthMatch[1] + widthMatch[2];
        if (heightMatch) frameHeight = heightMatch[1] + heightMatch[2];
        if (xMatch) frameX = xMatch[1] + xMatch[2];
        if (yMatch) frameY = yMatch[1] + yMatch[2];
        
        if (widthMatch && heightMatch) {
          const wVal = parseFloat(widthMatch[1]);
          const wUnit = widthMatch[2].toLowerCase();
          const hVal = parseFloat(heightMatch[1]);
          const hUnit = heightMatch[2].toLowerCase();
          
          let wCm = wVal;
          if (wUnit === 'in') wCm = wVal * 2.54;
          if (wUnit === 'mm') wCm = wVal * 0.1;
          if (wUnit === 'px') wCm = wVal * 0.026;
          
          let hCm = hVal;
          if (hUnit === 'in') hCm = hVal * 2.54;
          if (hUnit === 'mm') hCm = hVal * 0.1;
          if (hUnit === 'px') hCm = hVal * 0.026;
          
          // Filter out tiny images (decorations) AND large images (full-page backgrounds)
          // Decorations are often tall but narrow (e.g., 2.8cm wide). Real images are typically > 3.5cm wide.
          if (wCm < 3.3 || wCm > 18.0 || hCm < 1.5 || hCm > 25.0) {
            isTiny = true;
          }
          // The page footer/header decorations uniquely share a height of ~3.201cm (e.g. 4.075 x 3.201)
          if (Math.abs(hCm - 3.201) < 0.05) {
            isTiny = true;
          }
        }
        if (!isTiny) {
          elImagePath = rawImageHref;
        }
      } else {
        elImagePath = rawImageHref;
      }
    }
    
    // Split innerXml by <text:line-break> so products joined by Shift+Enter are correctly separated
    const lines = innerXml.split(/<text:line-break[^>]*\/>/gi);
    
    lines.forEach((lineXml, index) => {
      let firstSpanText = '';
      const spanMatch = lineXml.match(/<text:span[^>]*>([\s\S]*?)<\/text:span>/i);
      if (spanMatch) {
        firstSpanText = spanMatch[1].replace(/<[^>]*>/g, '').trim();
      }

      let cleanText = lineXml
        .replace(/<text:s\s+text:c="(\d+)"\s*\/>/gi, (_, count) => ' '.repeat(parseInt(count, 10)))
        .replace(/<text:s\s*\/>/gi, ' ')
        .replace(/<text:tab\s*\/>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
        
      if (cleanText || (index === 0 && rawImageHref)) {
        elements.push({
          tag,
          styleName,
          text: cleanText,
          firstSpanText,
          page: currentPage,
          imagePath: index === 0 ? elImagePath : null,
          rawImageHref: index === 0 ? rawImageHref : null,
          frameWidth: index === 0 ? frameWidth : null,
          frameHeight: index === 0 ? frameHeight : null,
          frameX: index === 0 ? frameX : null,
          frameY: index === 0 ? frameY : null,
          isTiny: index === 0 ? isTiny : false,
          index: m.index + index
        });
      }
    });
  }
  
  // 3. Extract all zip entries (including Pictures/) to tmp-odt
  console.log('4. Extracting all ODT assets including Pictures...');
  try {
    zip.extractAllTo(tmpOdtDir, true);
  } catch (err) {
    console.warn('⚠️ Warning: Failed to extract all entries to tmp-odt:', err.message);
  }

  // 4. Load baseline HTML extracted catalog CSV
  console.log('5. Loading baseline HTML extracted catalog for spatial matching...');
  
  function parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField);
    return fields;
  }

  function parseCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const fields = parseCSVLine(line);
      if (fields.length < headers.length) continue;
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = fields[index];
      });
      rows.push(row);
    }
    return rows;
  }

  const htmlCsvPath = path.join(extractionDir, 'extracted_catalog.csv');
  let htmlProducts = [];
  if (fs.existsSync(htmlCsvPath)) {
    try {
      const csvContent = fs.readFileSync(htmlCsvPath, 'utf8');
      const EXCLUDED_BASELINE_NAMES = new Set([
        'croissant', 'croissants', 'desserts', 'tarts', 'cake', 'cakes', 'pound', 'bar', 'pastries', 'savory', 'fruit desserts', 'cakes slices', 'tres leches party trays'
      ]);
      htmlProducts = parseCSV(csvContent)
        .map(p => ({
          name: p['Extracted Product Name'] || '',
          category: p['Category'] || '',
          price: p['Parsed Price'] || '',
          page: parseInt(p['Page No'] || '1', 10),
          x: parseInt(p['Location X'] || '0', 10),
          y: parseInt(p['Location Y'] || '0', 10),
          fontClass: p['Font Family Class'] || '',
          sizeClass: p['Font Size Class'] || '',
          imagePath: p['Product Image Path'] || '',
          description: p['Extracted Description'] || ''
        }))
        .filter(p => p.name && !EXCLUDED_BASELINE_NAMES.has(p.name.trim().toLowerCase()));
      console.log(`   Successfully loaded ${htmlProducts.length} products from HTML baseline.`);
    } catch (err) {
      console.error('❌ Error parsing HTML baseline CSV:', err.message);
    }
  } else {
    console.warn('⚠️ Warning: extracted_catalog.csv baseline not found. Coordinates & image fields will fallback to defaults.');
  }

  // 5. Group ODT Elements sequentially into Products using baseline prefix matching
  console.log('6. Processing sequential ODT elements into products...');
  
  function decodeEntities(str) {
    if (!str) return '';
    return str
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
  }

  function normalizeName(name) {
    if (!name) return '';
    let decoded = decodeEntities(name);
    let noAccents = decoded.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return noAccents.toLowerCase()
      .replace(/\([^)]*\)/g, '')   // Remove parenthetical descriptions like (party tray), (6 portions), (braided)
      .replace(/\bx\d+\b/gi, '')   // Remove standalone x10, x6, etc.
      .replace(/x\d+/gi, '')       // Remove any other x10 suffix
      .replace(/pistacho/gi, 'pistachio') // Standardize spelling variant
      .replace(/[^a-z0-9]/g, '')   // Keep only alphanumeric characters
      .trim();
  }

  function findMatchingTitlePrefix(text, isHeading) {
    const normText = normalizeName(text);
    if (!normText) return null;
    
    // First pass: try exact normalized match to avoid false positives
    for (const htmlProd of htmlProducts) {
      const normHtml = normalizeName(htmlProd.name);
      if (normHtml && normText === normHtml) {
        return htmlProd;
      }
    }
    
    // Second pass: try prefix match (for both headings and non-headings)
    // Only allow prefix matching if the text is short enough to be a title, to avoid matching descriptions that happen to start with a product name
    if (text.length < 80 || isHeading) {
      for (const htmlProd of htmlProducts) {
        const normHtml = normalizeName(htmlProd.name);
        if (normHtml && normHtml.length >= 8) {
          if (normText.startsWith(normHtml)) {
            return htmlProd;
          }
        }
      }
    }
    return null;
  }

  // 5a. Build dynamic page-shift map early to detect phantom text
  const earlyPageVotes = {};
  elements.forEach(el => {
    const text = el.text.trim();
    if (text.length < 3) return;
    const normText = normalizeName(text);
    let match = null;
    for (const htmlProd of htmlProducts) {
      if (normalizeName(htmlProd.name) === normText) {
        match = htmlProd;
        break;
      }
    }
    if (match) {
      if (!earlyPageVotes[el.page]) earlyPageVotes[el.page] = {};
      earlyPageVotes[el.page][match.page] = (earlyPageVotes[el.page][match.page] || 0) + 1;
    }
  });

  const odtToHtmlPageMap = {};
  for (const odtPage in earlyPageVotes) {
    let bestHtmlPage = null;
    let maxVotes = 0;
    for (const htmlPage in earlyPageVotes[odtPage]) {
      if (earlyPageVotes[odtPage][htmlPage] > maxVotes) {
        maxVotes = earlyPageVotes[odtPage][htmlPage];
        bestHtmlPage = parseInt(htmlPage, 10);
      }
    }
    odtToHtmlPageMap[odtPage] = bestHtmlPage;
  }

  const odtProducts = [];
  let currentProduct = null;
  let currentCategory = 'Uncategorized';

  const IGNORED_TITLES = new Set([
    'croissant', 'croissants', 'tarts', 'savory croissant', 'pound', 'bar', 'tres leches party trays', 'cakes slices', 'desserts', 'cakes', 'pastries', 'savory', 'fruit desserts'
  ]);

  let lastSeenImages = [];

  const expandedElements = [];
  elements.forEach(el => {
    let text = el.text.replace(/&amp;/gi, '&').trim();
    if (!text) {
       expandedElements.push(el);
       return;
    }
    
    // Split sentences separated by ". " to rescue products merged as sentences in the same paragraph
    const sentences = text.split(/(?<=[a-z0-9])\.\s+(?=[A-Z])/i);
    
    sentences.forEach((sentence, idx) => {
       // Decode &amp; in firstSpanText so length comparisons work
       let spanText = idx === 0 ? el.firstSpanText : '';
       if (spanText) spanText = spanText.replace(/&amp;/gi, '&');
       
       expandedElements.push({
         ...el,
         text: sentence.trim(),
         imagePath: idx === 0 ? el.imagePath : null,
         firstSpanText: spanText,
         isSubSentence: idx > 0
       });
    });
  });

  expandedElements.forEach((el) => {
    const text = el.text.trim();
    
    // Handle standalone image paragraphs (no text) to map them to the correct product
    if (!text && el.imagePath) {
      if (currentProduct && !currentProduct.imagePath) {
        currentProduct.imagePath = el.imagePath; // Trailing image for current product
      } else {
        lastSeenImages.push(el.imagePath);       // Leading image for future product
      }
      return;
    }

    // Skip category headers and subheaders
    if (IGNORED_TITLES.has(text.toLowerCase().trim())) {
      if (el.imagePath) {
        const widthVal = parseFloat(el.frameWidth || '0');
        if (widthVal >= 5.0) {
          lastSeenImages.push(el.imagePath);
        }
      }
      currentCategory = text;
      return;
    }

    // Detect category headers
    const isAllCaps = /^[A-Z\s&]+$/.test(text);
    const isBranding = /bakery|wholesale|distributor|@jhoanes/i.test(text);
    const isPrice = text.includes('$') || /^\d+\.\d{2}$/.test(text);
    
    if (el.tag === 'text:h' && isAllCaps && !isPrice && !isBranding && text.length < 35) {
      if (el.imagePath) {
        const widthVal = parseFloat(el.frameWidth || '0');
        if (widthVal >= 5.0) {
          lastSeenImages.push(el.imagePath);
        }
      }
      currentCategory = text;
      return;
    }
    
    // Skip branding and social media footers/headers
    if (isBranding && !text.includes('Croissant') && !text.includes('Roll') && !text.includes('Puff Pastry') && !text.includes('Cake')) {
      return;
    }

    // A. Prefix title match using baseline to handle merged title/description paragraphs
    const matchedHtmlProd = findMatchingTitlePrefix(text, el.tag === 'text:h');
    if (matchedHtmlProd) {
      // Prevent phantom text from stealing images by dropping matches that are vastly out of place
      const expectedHtmlPage = odtToHtmlPageMap[el.page];
      if (expectedHtmlPage !== undefined && expectedHtmlPage !== null) {
        if (Math.abs(expectedHtmlPage - matchedHtmlProd.page) > 1) {
          return; // Skip phantom text element completely
        }
      }

      if (currentProduct) odtProducts.push(currentProduct);
      
      let desc = '';
      if (text.toLowerCase().startsWith(matchedHtmlProd.name.toLowerCase())) {
        desc = text.substring(matchedHtmlProd.name.length).trim();
      } else {
        desc = text.substring(matchedHtmlProd.name.length).trim();
      }
      
      // Consume any recently parsed standalone image for this product
      let img = el.imagePath || lastSeenImages.shift() || null;

      currentProduct = {
        name: matchedHtmlProd.name,
        category: currentCategory,
        price: 'Not Found',
        description: desc,
        page: el.page,
        imagePath: img
      };
      return;
    }

    // B. Fallback to standard heading title detection, plus a heuristic for missing heading tags
    const isCapitalized = text.split(/\s+/).every(word => {
      if (!word) return true;
      const cleanWord = word.replace(/^[(]+/, '');
      if (!cleanWord) return true;
      if (['and', 'with', 'de', 'la', 'the', '&', 'x10', 'x6', 'or'].includes(cleanWord.toLowerCase())) return true;
      return cleanWord[0].toUpperCase() === cleanWord[0];
    });

    const couldBeTitleP = el.tag === 'text:p' 
      && text.length >= 3 
      && text.length < 60 
      && !/[.,:]$/.test(text)
      && isCapitalized;

    // C. Detect merged Title+Description paragraphs using the first span
    let isFirstSpanTitleCase = false;
    let extractedTitle = '';
    if (el.firstSpanText && el.firstSpanText.length >= 3) {
      const spanCapitalized = el.firstSpanText.split(/\s+/).every(word => {
        if (!word) return true;
        const cleanWord = word.replace(/^[(]+/, '');
        if (!cleanWord) return true;
        if (['and', 'with', 'de', 'la', 'the', '&', 'x10', 'x6', 'or'].includes(cleanWord.toLowerCase())) return true;
        return cleanWord[0].toUpperCase() === cleanWord[0];
      });
      if (spanCapitalized) {
        const words = el.firstSpanText.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 2 || /Tart|Cake|Roll|Croissant|Dessert|Passion|Bliss/i.test(el.firstSpanText)) {
          isFirstSpanTitleCase = true;
          extractedTitle = el.firstSpanText;
        }
      }
    }

    let isTitle = (el.tag === 'text:h' || couldBeTitleP || isFirstSpanTitleCase) && !isAllCaps && !isPrice && text.length >= 3;
    
    let aggressiveTitle = '';
    // Apply to any paragraph that failed isTitle but is long enough to be a merged Title+Description
    if (!isTitle && text.length > 15) {
      const match = text.match(/^(.*?)(Cake|Tart|Croissant|Roll|Tres Leches|Tiramis[uú]|Slice|Dream|Bliss)\b/i);
      if (match && match[0].length >= 5 && match[0].length < 50) {
        const candidate = match[0].trim();
        const words = candidate.split(/\s+/);
        const capWords = words.filter(w => /^[A-Z]/.test(w.replace(/^[(]+/, '')));
        // Strict capitalization: almost all words must be caps
        if (capWords.length >= 2 && capWords.length >= words.length - 1) {
          aggressiveTitle = candidate;
          isTitle = true;
        } else if (/tres leches/i.test(candidate) && !/^(Creamy|Smooth|Light|Moist|Delicate|Rich|Silky|Vanilla|Chocolate sponge)\b/i.test(candidate)) {
          aggressiveTitle = candidate;
          isTitle = true;
        }
      }
    }

    if (isTitle) {
      if (currentProduct) odtProducts.push(currentProduct);
      
      // Consume any recently parsed standalone image for this product
      let img = el.imagePath || lastSeenImages.shift() || null;

      let name = text;
      let desc = '';
      if (isFirstSpanTitleCase && text.length > extractedTitle.length) {
        name = extractedTitle;
        desc = text.substring(extractedTitle.length).trim();
      } else if (aggressiveTitle) {
        name = aggressiveTitle;
        desc = text.substring(aggressiveTitle.length).trim();
      }

      currentProduct = {
        name: name,
        category: currentCategory,
        price: 'Not Found',
        description: desc,
        page: el.page,
        imagePath: img
      };
    } else if (currentProduct) {
      // Only set image if currentProduct doesn't have an image path yet
      if (el.imagePath && !currentProduct.imagePath) {
        currentProduct.imagePath = el.imagePath;
      }
      if (isPrice) {
        if (currentProduct.price === 'Not Found') {
          currentProduct.price = text;
        }
      } else {
        if (currentProduct.description) {
          currentProduct.description += ' ' + text;
        } else {
          currentProduct.description = text;
        }
      }
    }
  });
  if (currentProduct) odtProducts.push(currentProduct);

  console.log(`   Grouped ${odtProducts.length} products sequentially.`);

  // 6. Match and Align Coordinates
  console.log('7. Aligning with baseline and assigning coordinates...');
  
  const csvRows = [];
  const catchLogLines = ['# Catalog Extraction Audit Report\n'];
  let anomaliesCount = 0;

  const autoLayoutGrid = [
    {x: 160, y: 800}, {x: 600, y: 800},
    {x: 160, y: 530}, {x: 600, y: 530},
    {x: 160, y: 200}, {x: 600, y: 200}
  ];
  let currentLayoutPage = -1;
  let layoutIndex = 0;

  odtProducts.forEach(odtProd => {
    let htmlMatch = htmlProducts.find(htmlProd => 
      normalizeName(htmlProd.name) === normalizeName(odtProd.name)
    );
    if (!htmlMatch) {
      htmlMatch = htmlProducts.find(htmlProd => {
        const nHtml = normalizeName(htmlProd.name);
        const nOdt = normalizeName(odtProd.name);
        return nHtml.length >= 8 && nOdt.startsWith(nHtml);
      });
    }

    let x = 0;
    let y = 0;
    let fontClass = 'ff3';
    let sizeClass = 'fs1';
    let imagePath = odtProd.imagePath ? 'tmp-odt/' + odtProd.imagePath : '';

    if (htmlMatch) {
      x = htmlMatch.x;
      y = htmlMatch.y;
      fontClass = htmlMatch.fontClass;
      sizeClass = htmlMatch.sizeClass;

      // Flag page shift anomalies
      const resolvedHtmlPage = odtToHtmlPageMap[odtProd.page] || odtProd.page;
      if (resolvedHtmlPage !== htmlMatch.page) {
         catchLogLines.push(`- **Page Shift Anomaly**: Product "${odtProd.name}" is on ODT Page ${odtProd.page} (mapped to HTML Page ${resolvedHtmlPage}), but its baseline coordinates are from HTML Page ${htmlMatch.page}.`);
         anomaliesCount++;
      }
      // Flag out of visual boundaries (e.g. beyond 1200x1600 typical page)
      if (x < 0 || x > 1500 || y < 0 || y > 2000) {
         catchLogLines.push(`- **Boundary Anomaly**: Product "${odtProd.name}" matched coordinates (${x}, ${y}) which appear out of bounds.`);
         anomaliesCount++;
      }

    } else {
      // Flag missing baseline match
      catchLogLines.push(`- **Missing Match**: Product "${odtProd.name}" on ODT Page ${odtProd.page} could not be matched to any baseline HTML product. Auto-layout applied.`);
      anomaliesCount++;
      
      if (currentLayoutPage !== odtProd.page) {
        currentLayoutPage = odtProd.page;
        layoutIndex = 0;
      }
      x = autoLayoutGrid[layoutIndex % autoLayoutGrid.length].x;
      y = autoLayoutGrid[layoutIndex % autoLayoutGrid.length].y;
      layoutIndex++;
    }

    if (!imagePath) {
      catchLogLines.push(`- **Missing Image**: Product "${odtProd.name}" on ODT Page ${odtProd.page} has no assigned image.`);
      anomaliesCount++;
    }

    csvRows.push({
      Name: odtProd.name,
      Category: odtProd.category,
      Price: odtProd.price,
      Page: odtProd.page, // Render all 21 pages linearly
      X: x,
      Y: y,
      Font: fontClass,
      Size: sizeClass,
      Image: imagePath,
      Description: odtProd.description || 'No Description'
    });
  });

  // 8. Write catalog.csv with single-word column headers
  console.log('8. Writing consolidated catalog.csv with single-word columns...');
  const catalogCsvPath = path.join(extractionDir, 'catalog.csv');
  const csvHeaders = ['Name', 'Category', 'Price', 'Page', 'X', 'Y', 'Font', 'Size', 'Image', 'Description'];
  const csvLines = csvRows.map(item => [
    `"${item.Name.replace(/"/g, '""')}"`,
    `"${item.Category.replace(/"/g, '""')}"`,
    `"${item.Price}"`,
    item.Page,
    item.X,
    item.Y,
    `"${item.Font}"`,
    `"${item.Size}"`,
    `"${item.Image.replace(/"/g, '""')}"`,
    `"${item.Description.replace(/"/g, '""')}"`
  ].join(','));
  fs.writeFileSync(catalogCsvPath, [csvHeaders.join(','), ...csvLines].join('\n'), 'utf8');

  // 8a. Write images.csv with every image not filtered out, and their position
  console.log('8a. Writing images.csv with spatial coordinates...');
  const imagesCsvPath = path.join(extractionDir, 'images.csv');
  const imagesCsvHeaders = ['Image', 'Page', 'X', 'Y'];
  
  function convertToPixels(valStr) {
    if (!valStr) return 0;
    const match = valStr.match(/^([\d.]+)(cm|in|mm|px)$/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit === 'cm') return Math.round(val * 37.79527);
    if (unit === 'in') return Math.round(val * 96);
    if (unit === 'mm') return Math.round(val * 3.779527);
    if (unit === 'px') return Math.round(val);
    return 0;
  }

  const directImages = [];
  const pageYTracker = {};

  // Independent sequential scan of officeTextContent to find ALL frames/images for images.csv
  const imagesScanRegex = /<(text:p|text:h)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let scanMatch;
  let scanCurrentPage = 1;

  while ((scanMatch = imagesScanRegex.exec(officeTextContent)) !== null) {
    const attrs = scanMatch[2];
    const innerXml = scanMatch[3];
    
    const styleMatch = attrs.match(/text:style-name="([^"]+)"/i);
    const styleName = styleMatch ? styleMatch[1] : null;
    
    const resolvedPage = getPageForStyle(styleName);
    if (resolvedPage !== null) {
      scanCurrentPage = resolvedPage;
    }
    
    // Find all draw:frame tags in this paragraph
    const frameRegex = /<draw:frame\b([^>]+)>([\s\S]*?)<\/draw:frame>/gi;
    let fm;
    while ((fm = frameRegex.exec(innerXml)) !== null) {
      const frameAttrs = fm[1];
      const frameInner = fm[2];
      const imgMatch = frameInner.match(/<draw:image[^>]+xlink:href="([^"]+)"/i);
      
      if (imgMatch) {
        const imagePath = imgMatch[1];
        let frameWidth = null;
        let frameHeight = null;
        let frameX = null;
        let frameY = null;
        let isTiny = false;
        
        const widthMatch = frameAttrs.match(/svg:width="([\d.]+)(cm|in|mm|px)"/i);
        const heightMatch = frameAttrs.match(/svg:height="([\d.]+)(cm|in|mm|px)"/i);
        const xMatch = frameAttrs.match(/svg:x="([\d.]+)(cm|in|mm|px)"/i);
        const yMatch = frameAttrs.match(/svg:y="([\d.]+)(cm|in|mm|px)"/i);
        
        if (widthMatch) frameWidth = widthMatch[1] + widthMatch[2];
        if (heightMatch) frameHeight = heightMatch[1] + heightMatch[2];
        if (xMatch) frameX = xMatch[1] + xMatch[2];
        if (yMatch) frameY = yMatch[1] + yMatch[2];
        
        if (widthMatch && heightMatch) {
          const wVal = parseFloat(widthMatch[1]);
          const wUnit = widthMatch[2].toLowerCase();
          const hVal = parseFloat(heightMatch[1]);
          const hUnit = heightMatch[2].toLowerCase();
          
          let wCm = wVal;
          if (wUnit === 'in') wCm = wVal * 2.54;
          if (wUnit === 'mm') wCm = wVal * 0.1;
          if (wUnit === 'px') wCm = wVal * 0.026;
          
          let hCm = hVal;
          if (hUnit === 'in') hCm = hVal * 2.54;
          if (hUnit === 'mm') hCm = hVal * 0.1;
          if (hUnit === 'px') hCm = hVal * 0.026;
          
          if (wCm < 3.3 || wCm > 18.0 || hCm < 1.5 || hCm > 25.0) {
            isTiny = true;
          }
          if (Math.abs(hCm - 3.201) < 0.05) {
            isTiny = true;
          }
        }
        
        if (!isTiny) {
          const xPx = convertToPixels(frameX);
          
          if (!pageYTracker[scanCurrentPage]) {
            pageYTracker[scanCurrentPage] = { left: 850, right: 850, center: 850 };
          }
          
          let yPx = 800;
          if (xPx < 350) {
            yPx = pageYTracker[scanCurrentPage].left;
            pageYTracker[scanCurrentPage].left -= 320;
          } else if (xPx > 450) {
            yPx = pageYTracker[scanCurrentPage].right;
            pageYTracker[scanCurrentPage].right -= 320;
          } else {
            yPx = pageYTracker[scanCurrentPage].center;
            pageYTracker[scanCurrentPage].center -= 320;
          }
          
          directImages.push({
            Image: 'tmp-odt/' + imagePath,
            Page: scanCurrentPage,
            X: xPx,
            Y: yPx
          });
        }
      }
    }
  }

  const imagesCsvLines = directImages.map(item => [
    `"${item.Image.replace(/"/g, '""')}"`,
    item.Page,
    item.X,
    item.Y
  ].join(','));
  fs.writeFileSync(imagesCsvPath, [imagesCsvHeaders.join(','), ...imagesCsvLines].join('\n'), 'utf8');

  // Write catch.md audit report
  const catchMdPath = path.join(extractionDir, 'catch.md');
  fs.writeFileSync(catchMdPath, catchLogLines.join('\n'), 'utf8');

  // Clean up stale debugging files from prior inspection phase
  ['debug_report.md'].forEach(f => {
    const staleFile = path.join(extractionDir, f);
    if (fs.existsSync(staleFile)) {
      try { fs.unlinkSync(staleFile); } catch (e) {}
    }
  });
  console.log('✨ Success! Consolidated catalog.csv created under resources/extraction/.');
} else {
  console.error('❌ Failed to extract content.xml or styles.xml');
}
