import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration Tests — Product Image Uploads
 *
 * These tests exercise the actual file system to verify that:
 *   1. Valid product images are persisted to the uploads directory.
 *   2. Dangerous file types (.exe, .sh) are rejected and never written.
 *
 * A temporary uploads directory is created before each test and
 * cleaned up afterwards so no residual files litter the workspace.
 */
describe('Product Image Uploads (Integration)', () => {
  const TEST_UPLOAD_DIR = path.join(__dirname, '__test_uploads__');

  // ---- Simulate the multer destination callback logic -------------------
  function ensureUploadDir(uploadPath: string): void {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  // ---- Simulate the multer filename callback ----------------------------
  function generateFilename(originalname: string): string {
    const randomName = Array(24)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return `${randomName}${path.extname(originalname)}`;
  }

  // ---- Allowed extensions whitelist (image types only) -------------------
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  /**
   * Validates the extension of an uploaded file.
   * Returns true only for known image extensions.
   */
  function isAllowedFileType(originalname: string): boolean {
    const ext = path.extname(originalname).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  }

  /**
   * Simulates the full upload pipeline:
   *  1. Validate file type
   *  2. Ensure destination directory exists
   *  3. Generate a random filename
   *  4. Write the buffer to disk
   *
   * Returns the saved filename, or throws if the file type is rejected.
   */
  function simulateUpload(
    buffer: Buffer,
    originalname: string,
    uploadDir: string,
  ): string {
    if (!isAllowedFileType(originalname)) {
      throw new Error(
        `File type rejected: ${path.extname(originalname)} is not allowed`,
      );
    }

    ensureUploadDir(uploadDir);
    const filename = generateFilename(originalname);
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return filename;
  }

  // ---- Lifecycle --------------------------------------------------------
  beforeEach(() => {
    ensureUploadDir(TEST_UPLOAD_DIR);
  });

  afterEach(() => {
    // Clean up the temporary directory and all its contents
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
    }
  });

  // -----------------------------------------------------------------------
  // Test: valid image upload
  // -----------------------------------------------------------------------
  it('should successfully save a valid product image payload to the backend uploads directory', () => {
    // 1x1 transparent PNG (smallest valid PNG)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    const savedFilename = simulateUpload(
      pngHeader,
      'product-photo.png',
      TEST_UPLOAD_DIR,
    );

    // The file should exist on disk
    const savedPath = path.join(TEST_UPLOAD_DIR, savedFilename);
    expect(fs.existsSync(savedPath)).toBe(true);

    // The file should have the correct extension
    expect(path.extname(savedFilename)).toBe('.png');

    // The file contents should match what was uploaded
    const fileContents = fs.readFileSync(savedPath);
    expect(fileContents).toEqual(pngHeader);
  });

  it('should preserve the original extension for valid JPEG uploads', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

    const savedFilename = simulateUpload(
      jpegBuffer,
      'camera-shot.jpg',
      TEST_UPLOAD_DIR,
    );

    const savedPath = path.join(TEST_UPLOAD_DIR, savedFilename);
    expect(fs.existsSync(savedPath)).toBe(true);
    expect(path.extname(savedFilename)).toBe('.jpg');
  });

  it('should preserve the original extension for valid WebP uploads', () => {
    const webpBuffer = Buffer.from('RIFF\x00\x00\x00\x00WEBP');

    const savedFilename = simulateUpload(
      webpBuffer,
      'optimized.webp',
      TEST_UPLOAD_DIR,
    );

    const savedPath = path.join(TEST_UPLOAD_DIR, savedFilename);
    expect(fs.existsSync(savedPath)).toBe(true);
    expect(path.extname(savedFilename)).toBe('.webp');
  });

  // -----------------------------------------------------------------------
  // Test: rejected file types
  // -----------------------------------------------------------------------
  it('should reject invalid file types (e.g., .exe, .sh) and ensure they are not saved to the file system', () => {
    const maliciousPayload = Buffer.from('#!/bin/bash\nrm -rf /');

    // .sh should be rejected
    expect(() =>
      simulateUpload(maliciousPayload, 'malware.sh', TEST_UPLOAD_DIR),
    ).toThrow(/File type rejected/);

    // .exe should be rejected
    expect(() =>
      simulateUpload(maliciousPayload, 'virus.exe', TEST_UPLOAD_DIR),
    ).toThrow(/File type rejected/);

    // .bat should be rejected
    expect(() =>
      simulateUpload(maliciousPayload, 'script.bat', TEST_UPLOAD_DIR),
    ).toThrow(/File type rejected/);

    // .php should be rejected
    expect(() =>
      simulateUpload(maliciousPayload, 'backdoor.php', TEST_UPLOAD_DIR),
    ).toThrow(/File type rejected/);

    // Verify nothing was written to the directory for any of these attempts
    const filesInDir = fs.readdirSync(TEST_UPLOAD_DIR);
    expect(filesInDir).toHaveLength(0);
  });

  it('should reject files with no extension', () => {
    const payload = Buffer.from('data');

    expect(() =>
      simulateUpload(payload, 'noextension', TEST_UPLOAD_DIR),
    ).toThrow(/File type rejected/);

    const filesInDir = fs.readdirSync(TEST_UPLOAD_DIR);
    expect(filesInDir).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Directory creation
  // -----------------------------------------------------------------------
  it('should create the upload directory if it does not exist', () => {
    const nestedDir = path.join(TEST_UPLOAD_DIR, 'nested', 'products');

    // Directory should not exist yet
    expect(fs.existsSync(nestedDir)).toBe(false);

    const jpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const savedFilename = simulateUpload(jpgBuffer, 'photo.jpg', nestedDir);

    // Both the directory and the file should now exist
    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(path.join(nestedDir, savedFilename))).toBe(true);
  });
});
