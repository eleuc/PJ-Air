"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
let ExcelService = class ExcelService {
    exportIndividual(orders) {
        const wb = XLSX.utils.book_new();
        const clientOrders = {};
        orders.forEach(order => {
            const name = order.user?.profile?.full_name || order.user?.email || 'Anónimo';
            if (!clientOrders[name])
                clientOrders[name] = [];
            clientOrders[name].push(order);
        });
        for (const [clientName, ordersList] of Object.entries(clientOrders)) {
            const rows = [];
            const order = ordersList[0];
            const deliveryDate = order.delivery_date || 'No especificada';
            const chofer = order.delivery_user?.profile?.full_name || 'No asignado';
            let addressStr = '';
            if (order.delivery_type === 'pickup') {
                addressStr = 'Retiro en Local';
            }
            else if (order.delivery_type === 'other') {
                addressStr = order.delivery_address_text || '';
            }
            else {
                addressStr = order.address?.address || '';
            }
            rows.push([`PEDIDO: ${clientName.toUpperCase()}`]);
            rows.push([`FECHA ENTREGA: ${deliveryDate.toUpperCase()}`]);
            rows.push([`CHOFER ASIGNADO: ${chofer.toUpperCase()}`]);
            rows.push([`DIRECCION: ${addressStr}`]);
            rows.push([]);
            const categories = {};
            ordersList.forEach(o => {
                (o.items || []).forEach(item => {
                    const cat = item.product?.category || 'Sin categoría';
                    if (!categories[cat])
                        categories[cat] = [];
                    const existing = categories[cat].find(it => it.productName === item.product?.name);
                    if (existing) {
                        existing.quantity += Number(item.quantity) || 0;
                    }
                    else {
                        categories[cat].push({
                            productName: item.product?.name || 'Producto',
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
                rows.push([]);
            }
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const cleanSheetName = clientName.replace(/[\\\/\?\*\[\]]/g, '').slice(0, 30) || 'Pedido';
            XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
        }
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
    exportConsolidated(orders) {
        const wb = XLSX.utils.book_new();
        const clientNames = Array.from(new Set(orders.map(o => o.user?.profile?.full_name || o.user?.email || 'Anónimo'))).sort();
        const dataStructure = {};
        orders.forEach(order => {
            const client = order.user?.profile?.full_name || order.user?.email || 'Anónimo';
            (order.items || []).forEach(item => {
                const cat = item.product?.category || 'Sin categoría';
                const prod = item.product?.name || 'Producto';
                const qty = Number(item.quantity) || 0;
                if (!dataStructure[cat])
                    dataStructure[cat] = {};
                if (!dataStructure[cat][prod])
                    dataStructure[cat][prod] = {};
                dataStructure[cat][prod][client] = (dataStructure[cat][prod][client] || 0) + qty;
            });
        });
        for (const [catName, products] of Object.entries(dataStructure)) {
            const rows = [];
            rows.push([`TOTAL ${catName.toUpperCase()}`]);
            rows.push([]);
            rows.push([`  ${catName.toUpperCase()}`]);
            const headers = ['PRODUCTO', ...clientNames.map(c => c.toUpperCase()), 'TOTAL'];
            rows.push(headers);
            const clientColumnTotals = {};
            let grandTotal = 0;
            for (const [prodName, clientQtys] of Object.entries(products)) {
                const row = [prodName];
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
            const totalsRow = [`TOTAL ${catName.toUpperCase()}`];
            clientNames.forEach(client => {
                totalsRow.push(clientColumnTotals[client] || 0);
            });
            totalsRow.push(grandTotal);
            rows.push(totalsRow);
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const cleanSheetName = catName.replace(/[\\\/\?\*\[\]]/g, '').toUpperCase().slice(0, 30) || 'Consolidado';
            XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
        }
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = __decorate([
    (0, common_1.Injectable)()
], ExcelService);
//# sourceMappingURL=excel.service.js.map