import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  
  exportIndividual(orders: Order[]): Buffer {
    const wb = XLSX.utils.book_new();
    const usedSheetNames = new Set<string>();

    // Group orders by client (user)
    const clientOrders: Record<string, Order[]> = {};
    orders.forEach(order => {
      const name = order?.user?.profile?.full_name || order?.user?.email || 'Anónimo';
      if (!clientOrders[name]) clientOrders[name] = [];
      clientOrders[name].push(order);
    });

    for (const [clientName, ordersList] of Object.entries(clientOrders)) {
      if (!ordersList || ordersList.length === 0) continue;
      
      const rows: any[][] = [];
      const order = ordersList[0];
      const deliveryDate = order?.delivery_date || 'No especificada';
      const chofer = order?.delivery_user?.profile?.full_name || 'No asignado';
      
      let addressStr = '';
      if (order?.delivery_type === 'pickup') {
        addressStr = 'Retiro en Local';
      } else if (order?.delivery_type === 'other') {
        addressStr = order?.delivery_address_text || '';
      } else {
        addressStr = order?.address?.address || '';
      }

      rows.push([`PEDIDO: ${clientName.toUpperCase()}`]);
      rows.push([`FECHA ENTREGA: ${deliveryDate.toUpperCase()}`]);
      rows.push([`CHOFER ASIGNADO: ${chofer.toUpperCase()}`]);
      rows.push([`DIRECCION: ${addressStr}`]);
      rows.push([]); // empty spacer

      // Group items of all orders of this client by product category
      const categories: Record<string, any[]> = {};
      ordersList.forEach(o => {
        (o.items || []).forEach(item => {
          const cat = item.product?.category?.name || 'Sin categoría';
          if (!categories[cat]) categories[cat] = [];
          
          const productName = item.product?.name || `Producto #${item.product_id || 'Desconocido'}`;
          
          // Merge quantities if same product
          const existing = categories[cat].find(it => it.productName === productName);
          if (existing) {
            existing.quantity += Number(item.quantity) || 0;
          } else {
            categories[cat].push({
              productName,
              quantity: Number(item.quantity) || 0,
              notes: o.notes || '',
            });
          }
        });
      });

      for (const [catName, items] of Object.entries(categories)) {
        rows.push([catName.toUpperCase()]);
        rows.push(['Producto', 'Cantidad (Unidades)', 'NOTAS']);
        
        let catTotal = 0;
        items.forEach(item => {
          rows.push([item.productName, item.quantity, item.notes]);
          catTotal += item.quantity;
        });
        
        rows.push([`TOTAL ${catName.toUpperCase()}`, catTotal]);
        rows.push([]); // empty spacer
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      
      // Clean sheet name (Excel sheets cannot contain \ / ? * [ ] : and must be <= 31 chars)
      const cleanSheetName = clientName.replace(/[\\\/\?\*\[\]\:]/g, '').slice(0, 30) || 'Pedido';
      let finalSheetName = cleanSheetName;
      let counter = 1;
      while (usedSheetNames.has(finalSheetName.toLowerCase())) {
        const suffix = `_${counter}`;
        finalSheetName = `${cleanSheetName.slice(0, 30 - suffix.length)}${suffix}`;
        counter++;
      }
      usedSheetNames.add(finalSheetName.toLowerCase());
      
      XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  exportConsolidated(orders: Order[]): Buffer {
    const wb = XLSX.utils.book_new();
    const usedSheetNames = new Set<string>();

    // 1. Get all unique client names (stores)
    const clientNames = Array.from(new Set(orders.map(o => 
      o?.user?.profile?.full_name || o?.user?.email || 'Anónimo'
    ))).sort();

    // 2. Group items by product category, then product name, then client name
    const dataStructure: Record<string, Record<string, Record<string, number>>> = {};
    
    orders.forEach(order => {
      const client = order?.user?.profile?.full_name || order?.user?.email || 'Anónimo';
      (order.items || []).forEach(item => {
        const cat = item.product?.category?.name || 'Sin categoría';
        const prod = item.product?.name || `Producto #${item.product_id || 'Desconocido'}`;
        const qty = Number(item.quantity) || 0;

        if (!dataStructure[cat]) dataStructure[cat] = {};
        if (!dataStructure[cat][prod]) dataStructure[cat][prod] = {};
        
        dataStructure[cat][prod][client] = (dataStructure[cat][prod][client] || 0) + qty;
      });
    });

    for (const [catName, products] of Object.entries(dataStructure)) {
      const rows: any[][] = [];

      rows.push([`TOTAL ${catName.toUpperCase()}`]);
      rows.push([]);
      rows.push([`  ${catName.toUpperCase()}`]);
      
      // Table headers
      const headers = ['PRODUCTO', ...clientNames.map(c => c.toUpperCase()), 'TOTAL'];
      rows.push(headers);

      const clientColumnTotals: Record<string, number> = {};
      let grandTotal = 0;

      // Product rows
      for (const [prodName, clientQtys] of Object.entries(products)) {
        const row: any[] = [prodName];
        let prodTotal = 0;

        clientNames.forEach(client => {
          const qty = clientQtys[client] || 0;
          row.push(qty > 0 ? qty : 0);
          prodTotal += qty;
          clientColumnTotals[client] = (clientColumnTotals[client] || 0) + qty;
        });

        row.push(prodTotal);
        grandTotal += prodTotal;
        rows.push(row);
      }

      // Totals row
      const totalsRow: any[] = [`TOTAL ${catName.toUpperCase()}`];
      clientNames.forEach(client => {
        totalsRow.push(clientColumnTotals[client] || 0);
      });
      totalsRow.push(grandTotal);
      rows.push(totalsRow);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      
      // Clean sheet name (Excel sheets cannot contain \ / ? * [ ] : and must be <= 31 chars)
      const cleanSheetName = catName.replace(/[\\\/\?\*\[\]\:]/g, '').toUpperCase().slice(0, 30) || 'CONSOLIDADO';
      let finalSheetName = cleanSheetName;
      let counter = 1;
      while (usedSheetNames.has(finalSheetName.toLowerCase())) {
        const suffix = `_${counter}`;
        finalSheetName = `${cleanSheetName.slice(0, 30 - suffix.length)}${suffix}`;
        counter++;
      }
      usedSheetNames.add(finalSheetName.toLowerCase());
      
      XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}

