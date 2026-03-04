'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { 
    Calendar as CalendarIcon, 
    Printer, 
    Search, 
    FileText,
    ArrowRight,
    Loader2,
    X,
    ChevronDown,
    MapPin,
    Package,
    ChevronUp
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientInfo {
    id: string;
    name: string;
    deliveryType: string;
    deliveryAddress?: string;
    addressAlias?: string;
}

interface ProductRow {
    name: string;
    category: string;
    price: number;
    clientQtys: Record<string, number>;
    total: number;
}

interface CategoryBlock {
    name: string;
    products: ProductRow[];
    clientTotals: Record<string, number>;
    grandTotal: number;
}

// ─── Inner Component (needs Suspense because of useSearchParams) ─────────────

function ReportsPageContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();

    // --- State ---
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
    const [viewMode, setViewMode] = useState<'general' | 'all-clients' | 'specific-client'>('general');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [reportMeta, setReportMeta] = useState<{ start: string; end: string } | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // --- Fetch Initial Data ---
    useEffect(() => {
        fetchClients();
        fetchHistory();
    }, []);

    // --- Auto-load from URL param (coming from dashboard 'Ver Detalle') ---
    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            setStartDate(dateParam);
            setEndDate(dateParam);
            setReportType('daily');
            setViewMode('general');
            fetchReportData(dateParam, dateParam, '');
        }
    }, [searchParams]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 31);
            const endStr = end.toISOString().split('T')[0] + ' 23:59:59';
            const startStr = start.toISOString().split('T')[0] + ' 00:00:00';
            const url = `http://localhost:3001/orders/reports/range?startDate=${encodeURIComponent(startStr)}&endDate=${encodeURIComponent(endStr)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setHistoryOrders(Array.isArray(data) ? data : []);
        } catch { console.error('Error fetching history'); }
        finally { setLoadingHistory(false); }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:3001/users');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setClients(data.filter((u: any) => u.role === 'client'));
        } catch { console.error('Error fetching clients'); }
    };

    // KEY FIX: accept dates directly to avoid stale state
    const fetchReportData = async (sd?: string, ed?: string, clientId?: string) => {
        const s = sd || startDate;
        const e = ed || endDate;
        const cid = clientId !== undefined ? clientId : selectedClientId;

        setLoading(true);
        setError(null);
        setOrders([]);
        try {
            const startParam = encodeURIComponent(s + ' 00:00:00');
            const endParam = encodeURIComponent(e + ' 23:59:59');
            let url = `http://localhost:3001/orders/reports/range?startDate=${startParam}&endDate=${endParam}`;
            if (viewMode === 'specific-client' && cid) url += `&userId=${cid}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Error al obtener datos del reporte');
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
            setReportMeta({ start: s, end: e });
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } catch (err: any) { setError(err.message || 'Error desconocido'); }
        finally { setLoading(false); }
    };

    const setDatesForType = (type: string) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();
        if (type === 'weekly') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            start = new Date(new Date().setDate(diff));
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (type === 'monthly') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        const s = start.toISOString().split('T')[0];
        const e = end.toISOString().split('T')[0];
        setStartDate(s);
        setEndDate(e);
    };

    const handleReportTypeChange = (val: string) => {
        setReportType(val as any);
        if (val !== 'custom') setDatesForType(val);
    };

    const handleViewDayDetail = (date: string) => {
        setReportType('daily');
        setViewMode('general');
        setStartDate(date);
        setEndDate(date);
        setSelectedClientId('');
        fetchReportData(date, date, '');
    };

    const handleGenerate = () => {
        fetchReportData(startDate, endDate, viewMode === 'specific-client' ? selectedClientId : '');
    };

    const reportData = useMemo((): { categories: CategoryBlock[]; clients: ClientInfo[] } => {
        if (!orders.length) return { categories: [], clients: [] };

        const clientKeyMap: Record<string, ClientInfo> = {};
        const clientKeyOrder: string[] = [];

        orders.forEach(order => {
            const cid = order.user_id;
            const name = order.user?.profile?.full_name || order.user?.profile?.username || order.user?.email || 'Unknown';
            const dType = order.delivery_type || 'pickup';
            const addressLabel = order.address?.alias || order.delivery_address_text || '';
            const key = `${cid}__${dType}__${addressLabel}`;
            if (!clientKeyMap[key]) {
                clientKeyMap[key] = { id: cid, name, deliveryType: dType, deliveryAddress: order.delivery_address_text || order.address?.address || '', addressAlias: addressLabel };
                clientKeyOrder.push(key);
            }
        });

        const clientList = clientKeyOrder.map(k => clientKeyMap[k]);
        const catMap: Record<string, CategoryBlock> = {};

        orders.forEach(order => {
            const cid = order.user_id;
            const dType = order.delivery_type || 'pickup';
            const addressLabel = order.address?.alias || order.delivery_address_text || '';
            const colKey = `${cid}__${dType}__${addressLabel}`;

            (order.items || []).forEach((item: any) => {
                const cat = item.product?.category || 'Sin Categoría';
                const prod = item.product?.name || 'Producto';
                const qty = Number(item.quantity) || 0;

                if (!catMap[cat]) catMap[cat] = { name: cat, products: [], clientTotals: {}, grandTotal: 0 };
                let productRow = catMap[cat].products.find(p => p.name === prod);
                if (!productRow) {
                    productRow = { name: prod, category: cat, price: Number(item.price_at_time) || 0, clientQtys: {}, total: 0 };
                    catMap[cat].products.push(productRow);
                }

                productRow.clientQtys[colKey] = (productRow.clientQtys[colKey] || 0) + qty;
                productRow.total += qty;
                catMap[cat].clientTotals[colKey] = (catMap[cat].clientTotals[colKey] || 0) + qty;
                catMap[cat].grandTotal += qty;
            });
        });

        return { categories: Object.values(catMap), clients: clientList };
    }, [orders]);

    const historyTable = useMemo(() => {
        const days: Record<string, Record<string, number>> = {};
        historyOrders.forEach(order => {
            // FIX: Normalize date key to YYYY-MM-DD. Priority: delivery_date if standard, else created_at
            let dateKey = '';
            const delDate = order.delivery_date || '';
            const creDate = order.created_at || '';
            
            if (/\d{4}-\d{2}-\d{2}/.test(delDate)) {
                dateKey = delDate.match(/\d{4}-\d{2}-\d{2}/)![0];
            } else if (/\d{4}-\d{2}-\d{2}/.test(creDate)) {
                dateKey = creDate.match(/\d{4}-\d{2}-\d{2}/)![0];
            } else {
                const d = new Date(delDate || creDate);
                if (!isNaN(d.getTime())) {
                    dateKey = d.toISOString().split('T')[0];
                }
            }

            if (!dateKey) return;
            if (!days[dateKey]) days[dateKey] = { total: 0 };
            (order.items || []).forEach((item: any) => {
                const cat = item.product?.category || 'Otros';
                const qty = Number(item.quantity) || 0;
                days[dateKey][cat] = (days[dateKey][cat] || 0) + qty;
                days[dateKey].total += qty;
            });
        });
        return Object.entries(days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10);
    }, [historyOrders]);

    const filteredClients = clients.filter(c =>
        (c.profile?.full_name || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(clientSearch.toLowerCase())
    );

    const deliveryLabel = (type: string) => {
        if (type === 'pickup') return 'Pickup';
        if (type === 'other' || type === 'temporal') return 'Temporal';
        if (type === 'saved') return 'Dirección';
        return type;
    };

    const deliveryColor = (type: string) => {
        if (type === 'pickup') return 'bg-blue-100 text-blue-700';
        if (type === 'other' || type === 'temporal') return 'bg-orange-100 text-orange-700';
        return 'bg-green-100 text-green-700';
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        // Clean possible 'T' or strange suffix for safety
        const cleanD = d.includes(' ') ? d.split(' ')[0] : d.split('T')[0];
        // If it looks like a normalized date YYYY-MM-DD
        if (/\d{4}-\d{2}-\d{2}/.test(cleanD)) {
            const date = new Date(cleanD + 'T12:00:00');
            if (isNaN(date.getTime())) return d;
            return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        return d;
    };

    const allCategories = useMemo(() => {
        return [...new Set(historyOrders.flatMap(o => (o.items || []).map((it: any) => it.product?.category || 'Otros')))];
    }, [historyOrders]);

    // ─── CHUNKING FOR PRINT (horizontal split) ──────────────────────────────────
    // Split clients into groups of 80 for maximum density (at 9px per col, many fit)
    const clientGroups = useMemo(() => {
        const groups = [];
        const chunkSize = 80; 
        for (let i = 0; i < reportData.clients.length; i += chunkSize) {
            groups.push(reportData.clients.slice(i, i + chunkSize));
        }
        return groups.length > 0 ? groups : [[]];
    }, [reportData.clients]);

    return (
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 print:p-4 print:m-0 print:max-w-none print:space-y-4">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Reportes Generales</h1>
                    <p className="text-muted-foreground text-sm">Panel de reportes avanzados con desglose por cliente</p>
                </div>
                {orders.length > 0 && (
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 group"
                    >
                        <Printer size={16} className="group-hover:scale-110 transition-transform" />
                        Imprimir Reporte
                    </button>
                )}
            </header>

            {/* Filter Panel */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 space-y-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Col 1 */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de Reporte</label>
                            <div className="relative">
                                <select value={reportType} onChange={e => handleReportTypeChange(e.target.value)}
                                    className="w-full px-5 pr-12 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer h-14">
                                    <option value="daily">Reporte Diario</option>
                                    <option value="weekly">Reporte Semanal</option>
                                    <option value="monthly">Reporte Mensual</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Concepto</label>
                            <div className="relative">
                                <select value={viewMode} onChange={e => setViewMode(e.target.value as any)}
                                    className="w-full h-14 px-5 pr-12 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                                    <option value="general">Reporte General (todos los clientes)</option>
                                    <option value="specific-client">Reporte por Cliente</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buscador de Clientes</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input type="text" placeholder={viewMode === 'specific-client' ? "Buscar cliente específico..." : "Todos los clientes..."}
                                    value={clientSearch}
                                    onChange={e => { setClientSearch(e.target.value); if (!e.target.value) { setSelectedClientId(''); } }}
                                    className="w-full h-14 pl-11 pr-10 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                                {clientSearch && !selectedClientId && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                                        {filteredClients.map(c => (
                                            <button key={c.id} onClick={() => { setSelectedClientId(c.id); setClientSearch(c.profile?.full_name || c.email); if (viewMode !== 'specific-client') setViewMode('specific-client'); }}
                                                className="w-full px-5 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-0">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                                                    {(c.profile?.full_name || c.email)?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{c.profile?.full_name || c.email}</p>
                                                    {c.profile?.company_name && <p className="text-[10px] text-primary font-black uppercase">{c.profile.company_name}</p>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedClientId && (
                                    <button onClick={() => { setSelectedClientId(''); setClientSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Período</label>
                            <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-2xl px-3 py-2">
                                <CalendarIcon className="text-muted-foreground shrink-0" size={15} />
                                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setReportType('custom'); }}
                                    className="flex-1 bg-transparent text-sm font-bold outline-none cursor-pointer" />
                                <span className="text-muted-foreground font-black text-xs">–</span>
                                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setReportType('custom'); }}
                                    className="flex-1 bg-transparent text-sm font-bold outline-none cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    {/* Col 3 */}
                    <div className="flex flex-col justify-end">
                        <button onClick={handleGenerate} disabled={loading}
                            className="w-full h-14 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="group-hover:scale-110 transition-transform" />}
                            Generar Reporte
                        </button>
                        {error && <p className="mt-3 text-xs text-red-500 font-bold text-center">{error}</p>}
                    </div>
                </div>
            </div>

            {/* ─── REPORT RESULTS ─────────────────────────────────────────── */}
            {reportMeta && (
                <div ref={resultsRef} className="space-y-0 report-content">
                    {/* Print header */}
                    {orders.length > 0 && (
                        <div className="hidden print:block mb-4">
                            <h1 className="text-center text-base font-black uppercase underline">Reporte General — Panadería Jhoanes</h1>
                            <p className="text-center text-xs mt-1">
                                {reportMeta.start === reportMeta.end ? formatDate(reportMeta.start) : `${reportMeta.start} — ${reportMeta.end}`}
                            </p>
                        </div>
                    )}

                    {/* Screen header */}
                    <div className="print:hidden bg-card border border-border rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Reporte Generado</p>
                                <h2 className="text-2xl font-black tracking-tight">
                                    {reportMeta.start === reportMeta.end ? formatDate(reportMeta.start) : `${reportMeta.start} — ${reportMeta.end}`}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {orders.length} pedidos · {reportData.clients.length} columnas de clientes · {reportData.categories.reduce((a, c) => a + c.products.length, 0)} productos
                                </p>
                            </div>
                            {orders.length > 0 && (
                                <button onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 group">
                                    <Printer size={16} className="group-hover:scale-110 transition-transform print:hidden" />
                                    <span className="print:hidden">Imprimir</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tables (Print chunked version) */}
                    {reportData.categories.map((cat, catIdx) => (
                        <div key={cat.name} className={`${catIdx > 0 ? 'mt-8 print:mt-12' : ''} report-category`}>
                            {/* Screen View (Normal scrollable table) */}
                            <div className="print:hidden">
                                <div className="bg-yellow-400 text-black px-6 py-3 flex items-center gap-3 rounded-t-[2rem]">
                                    <Package size={16} className="shrink-0" />
                                    <span className="font-black text-sm uppercase tracking-widest">Categoría: {cat.name}</span>
                                    <span className="ml-auto font-black text-sm">{cat.grandTotal} uds. totales</span>
                                </div>
                                <div className="overflow-x-auto border border-border rounded-b-[2rem] shadow-sm">
                                    <table className="w-full border-collapse text-left" style={{ minWidth: `${200 + reportData.clients.length * 90}px` }}>
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="py-3 px-4 font-black text-xs uppercase tracking-wider text-muted-foreground border-b border-r border-border sticky left-0 bg-muted/30 z-10 min-w-[160px]">Producto</th>
                                                {reportData.clients.map((client, ci) => (
                                                    <th key={ci} className="py-3 px-3 border-b border-r border-border text-center min-w-[80px]">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <button onClick={() => setActiveTooltip(activeTooltip === `${catIdx}-${ci}` ? null : `${catIdx}-${ci}`)}
                                                                className="font-black text-[10px] uppercase leading-tight hover:text-primary transition-colors relative group">
                                                                {client.name}
                                                                {client.addressAlias && <span className="block text-[8px] text-muted-foreground font-bold normal-case">{client.addressAlias}</span>}
                                                            </button>
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase leading-none ${deliveryColor(client.deliveryType)}`}>{deliveryLabel(client.deliveryType)}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="py-3 px-4 border-b border-border text-right font-black text-xs uppercase bg-yellow-50 text-yellow-800 min-w-[70px]">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {cat.products.map((prod, pi) => (
                                                <tr key={pi} className="hover:bg-muted/20 transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-sm border-r border-border sticky left-0 bg-white z-10 leading-tight">{prod.name}</td>
                                                    {reportData.clients.map((client, ci) => {
                                                        const colKey = `${client.id}__${client.deliveryType}__${client.addressAlias || ''}`;
                                                        return <td key={ci} className="py-3 px-3 text-center text-sm border-r border-border font-bold text-muted-foreground">{prod.clientQtys[colKey] || '—'}</td>;
                                                    })}
                                                    <td className="py-3 px-4 text-right font-black text-sm bg-yellow-50/80 text-yellow-800">{prod.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Print View (Chunking to fit Carta page) */}
                            <div className="hidden print:block">
                                {clientGroups.map((groupClients, groupIdx) => (
                                    <div key={groupIdx} className={`mb-8 ${groupIdx > 0 ? 'page-break-before-auto mt-6' : ''}`}>
                                        <div className="bg-yellow-300 px-3 py-1.5 flex items-center gap-2 border border-black border-b-0">
                                            <span className="font-black text-[11pt] uppercase">Categoría: {cat.name} {clientGroups.length > 1 ? `(Pág ${groupIdx + 1}/${clientGroups.length})` : ''}</span>
                                            <span className="ml-auto font-black text-[11pt]">Pedido General · {reportMeta?.start === reportMeta?.end ? formatDate(reportMeta.start) : 'Reporte'}</span>
                                        </div>
                                        <div className="border border-black overflow-hidden">
                                            <table className="w-full border-collapse text-left">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="py-1 px-0.5 font-black text-[5.5pt] uppercase border-b border-r border-black min-w-[35px] max-w-[35px] overflow-hidden">Prod</th>
                                                        {groupClients.map((client, ci) => (
                                                            <th key={ci} className="vertical-header-th border-b border-r border-black text-center min-w-[9px] max-w-[9px]">
                                                                <div className="vertical-header-content">
                                                                    <div className="vertical-client-name">{client.name}</div>
                                                                </div>
                                                            </th>
                                                        ))}
                                                        {groupIdx === clientGroups.length - 1 && (
                                                            <th className="py-1 px-0.5 border-b border-black text-right font-black text-[5pt] bg-yellow-100 min-w-[13px] max-w-[13px]">T</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-black">
                                                    {cat.products.map((prod, pi) => (
                                                        <tr key={pi} className={pi % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                                                            <td className="py-0 px-0.5 font-normal text-[6pt] border-r border-black leading-tight truncate min-w-[35px] max-w-[35px] overflow-hidden" title={prod.name}>
                                                                {prod.name.length > 7 ? prod.name.substring(0, 6) + '…' : prod.name}
                                                            </td>
                                                            {groupClients.map((client, ci) => {
                                                                const colKey = `${client.id}__${client.deliveryType}__${client.addressAlias || ''}`;
                                                                const qty = prod.clientQtys[colKey] || 0;
                                                                return (
                                                                    <td key={ci} className="py-0 px-0.5 text-center text-[8.5pt] border-r border-black font-bold">
                                                                        {qty > 0 ? qty : '.'}
                                                                    </td>
                                                                );
                                                            })}
                                                            {groupIdx === clientGroups.length - 1 && (
                                                                <td className="py-0 px-0.1 text-right font-black text-[6.5pt] bg-yellow-100 min-w-[13px] max-w-[13px] overflow-hidden">{prod.total}</td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-yellow-300 font-black border-t-2 border-black">
                                                        <td className="py-1 px-0.5 font-black text-[6pt] border-r border-black min-w-[35px] max-w-[35px] overflow-hidden truncate">T.</td>
                                                        {groupClients.map((client, ci) => {
                                                            const colKey = `${client.id}__${client.deliveryType}__${client.addressAlias || ''}`;
                                                            return (
                                                                <td key={ci} className="py-0 px-0.5 text-center font-black text-[8.5pt] border-r border-black">
                                                                    {cat.clientTotals[colKey] || 0}
                                                                </td>
                                                            );
                                                        })}
                                                        {groupIdx === clientGroups.length - 1 && (
                                                            <td className="py-0 px-0.1 text-right font-black text-[6.5pt] min-w-[13px] max-w-[13px] bg-yellow-300 overflow-hidden">{cat.grandTotal}</td>
                                                        )}
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {reportData.categories.length === 0 && !loading && (
                        <div className="bg-muted/20 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center py-24 text-center print:hidden">
                            <FileText size={48} className="text-muted-foreground/30 mb-4" />
                            <p className="font-black text-lg text-muted-foreground">Sin datos para este período</p>
                        </div>
                    )}
                </div>
            )}

            {/* Loading spinner */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 print:hidden">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Generando reporte...</p>
                </div>
            )}

            {/* ─── HISTORY TABLE ──────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-[2.5rem] shadow-xl shadow-foreground/5 overflow-hidden print:hidden">
                <div className="p-8 border-b border-border flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-2xl">
                        <FileText className="text-muted-foreground" size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight">Historial — Últimos 10 Días</h2>
                        <p className="text-xs text-muted-foreground italic">Unidades totales por categoría · Haz click en "Ver Detalle" para generar el reporte</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/20 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                {allCategories.map(cat => <th key={cat} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat}</th>)}
                                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Uds.</th>
                                <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loadingHistory && (
                                <tr><td colSpan={allCategories.length + 3} className="py-16 text-center"><Loader2 size={28} className="animate-spin mx-auto text-primary/30" /></td></tr>
                            )}
                            {historyTable.map(([date, data]) => (
                                <tr key={date} className="hover:bg-muted/20 transition-colors">
                                    <td className="py-4 px-6 font-black text-sm">{formatDate(date)}</td>
                                    {allCategories.map(cat => (
                                        <td key={cat} className="py-4 px-6 font-bold text-muted-foreground text-sm">
                                            {((data as any)[cat] || 0).toLocaleString()} <span className="text-[10px] opacity-50">uds</span>
                                        </td>
                                    ))}
                                    <td className="py-4 px-6 text-right font-black text-primary">
                                        {((data as any).total || 0).toLocaleString()} <span className="text-[10px] font-bold opacity-60">uds</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-center">
                                            <button onClick={() => handleViewDayDetail(date)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all group">
                                                Ver Detalle
                                                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loadingHistory && historyTable.length === 0 && (
                                <tr><td colSpan={allCategories.length + 3} className="py-16 text-center text-muted-foreground italic text-sm">Sin datos históricos recientes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { size: letter landscape; margin: 0.5cm; }
                    body { background: white !important; color: black !important; font-size: 10pt !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    
                    nav, aside, .AdminSidebar, header.print\\:hidden, .print\\:hidden { 
                        display: none !important; 
                        width: 0 !important;
                        height: 0 !important;
                        visibility: hidden !important;
                    }.flex, div[class*="min-h-screen"] { 
                        display: block !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                    }
                    
                    main { 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        max-width: 100% !important; 
                        width: 100% !important; 
                    }

                    table { border-collapse: collapse !important; width: 100% !important; font-size: 8pt !important; table-layout: fixed !important; }
                    th, td { border: 1px solid black !important; padding: 1px 2px !important; line-height: 1 !important; overflow: hidden; }
                    
                    /* FORCE FIXED WIDTHS FOR FIRST AND LAST COLUMNS */
                    th:first-child, td:first-child { width: 35px !important; min-width: 35px !important; max-width: 35px !important; }
                    th:last-child, td:last-child { width: 13px !important; min-width: 13px !important; max-width: 13px !important; }
                    
                    th { font-weight: bold !important; font-size: 6pt !important; }
                    td { font-size: 6.5pt !important; }
                    
                    tr { page-break-inside: avoid; height: 10pt !important; }
                    thead { display: table-header-group; }
                    .sticky { position: static !important; }

                    .vertical-header-th {
                        height: 60px;
                        width: 9px !important;
                        vertical-align: bottom;
                        padding: 0 !important;
                    }
                    
                    .vertical-header-content {
                        writing-mode: vertical-rl;
                        transform: rotate(180deg);
                        white-space: nowrap;
                        text-align: left;
                        font-weight: 900;
                        font-size: 5pt;
                        display: flex;
                        justify-content: flex-start;
                        width: 9px;
                        padding-top: 1px;
                    }

                    .vertical-client-name {
                        text-transform: uppercase;
                        font-weight: 900;
                    }
                    .vertical-delivery-label {
                        font-size: 7pt;
                        font-weight: 900;
                        color: #1d4ed8 !important; /* Blue-700 */
                        text-transform: uppercase;
                    }
                }
            `}</style>
        </main>
    );
}

// ─── Main Export Component with Suspense ──────────────────────────────────────
export default function ReportsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Cargando reportes...</p>
                </div>
            }>
                <ReportsPageContent />
            </Suspense>
        </div>
    );
}
