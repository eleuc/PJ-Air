'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    Printer, 
    Search, 
    User as UserIcon, 
    Filter,
    Table as TableIcon,
    FileText,
    ArrowRight,
    Users as UsersIcon,
    Loader2,
    X,
    ChevronDown
} from 'lucide-react';

interface ReportProduct {
    name: string;
    quantity: number;
    price: number;
    deliveryTypes?: Record<string, number>;
}

interface ReportCategory {
    name: string;
    products: Record<string, ReportProduct>;
    subtotal: number;
    totalQuantity: number;
}

interface ClientColumn {
    id: string;
    name: string;
    company?: string;
}

export default function ReportsPage() {
    const { t } = useLanguage();
    const { user: currentUser } = useAuth();
    
    // --- State ---
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
    const [viewMode, setViewMode] = useState<'general' | 'all-clients' | 'specific-client'>('general');
    
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [clientSearch, setClientSearch] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Initial Data ---
    useEffect(() => {
        fetchClients();
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 31);
            const url = `http://localhost:3001/orders/reports/range?startDate=${start.toISOString().split('T')[0]}T00:00:00.000Z&endDate=${end.toISOString().split('T')[0]}T23:59:59.999Z`;
            const res = await fetch(url);
            const data = await res.json();
            setHistoryOrders(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:3001/users');
            const data = await res.json();
            setClients(data.filter((u: any) => u.role === 'client'));
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:3001/orders/reports/range?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`;
            if (viewMode === 'specific-client' && selectedClientId) {
                url += `&userId=${selectedClientId}`;
            }
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch report data');
            const data = await res.json();
            setOrders(data);
            
            // Scroll to the results
            setTimeout(() => {
                const element = document.getElementById('report-results');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers ---
    const setDatesForType = (type: string) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === 'daily') {
            // current day
        } else if (type === 'weekly') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            start = new Date(now.setDate(diff));
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (type === 'monthly') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleReportTypeChange = (val: string) => {
        setReportType(val as any);
        if (val !== 'custom') {
            setDatesForType(val);
        }
    };

    // --- Process Data ---
    const processedData = useMemo(() => {
        if (!orders.length) return { categories: {}, total: 0, clientCols: [] };

        const categories: Record<string, ReportCategory> = {};
        let grandTotal = 0;
        const clientColsMap: Record<string, ClientColumn> = {};

        orders.forEach(order => {
            const clientName = order.user?.profile?.full_name || order.user?.username || 'Unknown';
            const clientId = order.user_id;
            
            if (!clientColsMap[clientId]) {
                clientColsMap[clientId] = { 
                    id: clientId, 
                    name: clientName,
                    company: order.user?.profile?.company_name
                };
            }

            order.items?.forEach((item: any) => {
                const catName = item.product?.category || 'Uncategorized';
                const prodName = item.product?.name || 'Unknown Product';
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price_at_time) || 0;
                const sub = qty * price;

                if (!categories[catName]) {
                    categories[catName] = { name: catName, products: {}, subtotal: 0, totalQuantity: 0 };
                }

                if (!categories[catName].products[prodName]) {
                    categories[catName].products[prodName] = { name: prodName, quantity: 0, price: price, deliveryTypes: {} };
                }

                const dType = order.delivery_type || 'pickup';
                const deliveryRecord = categories[catName].products[prodName].deliveryTypes || {};
                deliveryRecord[dType] = (deliveryRecord[dType] || 0) + qty;
                categories[catName].products[prodName].deliveryTypes = deliveryRecord;

                categories[catName].products[prodName].quantity += qty;
                categories[catName].subtotal += sub;
                categories[catName].totalQuantity += qty;
                grandTotal += sub;
            });
        });

        return { 
            categories, 
            total: grandTotal,
            clientCols: Object.values(clientColsMap)
        };
    }, [orders]);

    const allClientsTableData = useMemo(() => {
        if (viewMode !== 'all-clients') return null;
        const table: Record<string, { category: string, products: Record<string, Record<string, number>> }> = {};
        orders.forEach(order => {
            const clientId = order.user_id;
            order.items?.forEach((item: any) => {
                const catName = item.product?.category || 'Uncategorized';
                const prodName = item.product?.name || 'Unknown';
                const qty = Number(item.quantity) || 0;
                if (!table[catName]) table[catName] = { category: catName, products: {} };
                if (!table[catName].products[prodName]) table[catName].products[prodName] = {};
                table[catName].products[prodName][clientId] = (table[catName].products[prodName][clientId] || 0) + qty;
            });
        });
        return table;
    }, [orders, viewMode]);

    const historyTable = useMemo(() => {
        const days: Record<string, Record<string, number>> = {};
        historyOrders.forEach(order => {
            const date = (order.delivery_date || order.created_at || '').split('T')[0];
            if (!date) return;
            if (!days[date]) days[date] = { total: 0 };
            order.items?.forEach((item: any) => {
                const cat = item.product?.category || 'Otros';
                const displayCat = cat === 'Croissants' ? 'Croissants' : cat === 'Postres' ? 'Postres' : 'Pasteles';
                const qty = Number(item.quantity) || 0;
                days[date][displayCat] = (days[date][displayCat] || 0) + qty;
                days[date].total += qty;
            });
        });
        return Object.entries(days)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 10); // Show last 10 days as requested
    }, [historyOrders]);

    const handleViewDayDetail = (date: string) => {
        setReportType('daily');
        setViewMode('general');
        setStartDate(date);
        setEndDate(date);
        setTimeout(() => {
            fetchReportData();
        }, 100);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredClients = clients.filter(c => 
        (c.profile?.full_name || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.username || '').toLowerCase().includes(clientSearch.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 print:p-0 print:m-0 print:max-w-none">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">{t.reports.title}</h1>
                        <p className="text-muted-foreground">Panel de reportes avanzados y estadísticas</p>
                    </div>
                    
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <Printer size={16} className="group-hover:scale-110 transition-transform" />
                        <span>{t.reports.print}</span>
                    </button>
                </header>

                {/* Main Filter Panel */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 space-y-8 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* Report Type & Concept Selects */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tipo de Reporte</label>
                                <div className="relative">
                                    <select 
                                        value={reportType}
                                        onChange={(e) => handleReportTypeChange(e.target.value)}
                                        className="w-full h-14 pl-5 pr-12 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="daily">Reporte Diario</option>
                                        <option value="weekly">Reporte Semanal</option>
                                        <option value="monthly">Reporte Mensual</option>
                                        <option value="custom">Reporte Personalizado</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Concepto de Reporte</label>
                                <div className="relative">
                                    <select 
                                        value={viewMode}
                                        onChange={(e) => setViewMode(e.target.value as any)}
                                        className="w-full h-14 pl-5 pr-12 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="general">Reporte General</option>
                                        <option value="all-clients">Desglose por Cliente</option>
                                        <option value="specific-client">Reporte de Cliente Específico</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Client Search & Period */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Buscador de Clientes</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Todos los clientes..."
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            if (!e.target.value) {
                                                setSelectedClientId('');
                                                if (viewMode === 'specific-client') setViewMode('general');
                                            }
                                        }}
                                        className="w-full h-14 pl-12 pr-5 bg-muted/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                    {clientSearch && filteredClients.length > 0 && !selectedClientId && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-[2rem] shadow-2xl z-50 max-h-60 overflow-y-auto overflow-hidden">
                                            {filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedClientId(c.id);
                                                        setClientSearch(c.profile?.full_name || c.username);
                                                        setViewMode('specific-client');
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between border-b border-border last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-bold">{c.profile?.full_name || c.username}</p>
                                                        {c.profile?.company_name && <p className="text-[10px] text-muted-foreground uppercase font-black">{c.profile.company_name}</p>}
                                                    </div>
                                                    <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedClientId && (
                                        <button 
                                            onClick={() => { setSelectedClientId(''); setClientSearch(''); setViewMode('general'); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Período (Calendario)</label>
                                <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-[1.5rem] border border-border">
                                    <div className="relative flex-1">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => { setStartDate(e.target.value); setReportType('custom'); }}
                                            className="w-full h-10 pl-9 pr-2 bg-transparent text-xs font-bold outline-none cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-muted-foreground font-black text-xs">→</span>
                                    <div className="relative flex-1">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => { setEndDate(e.target.value); setReportType('custom'); }}
                                            className="w-full h-10 pl-9 pr-2 bg-transparent text-xs font-bold outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="lg:col-span-1 flex flex-col justify-end">
                            <button 
                                onClick={fetchReportData}
                                disabled={loading}
                                className="w-full h-14 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="group-hover:scale-110 transition-transform" />}
                                <span>Generar Reporte</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Results */}
                {orders.length > 0 && (
                    <div id="report-results" className="animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white text-black p-10 rounded-[3rem] shadow-2xl border border-border print:border-none print:shadow-none print:p-0 space-y-10 min-h-[600px]">
                            
                            {/* Visual Identification Header */}
                            <div className="border-b-4 border-primary pb-8 flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest uppercase">
                                        <TableIcon size={12} /> Oficial
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter">Resumen Ejecutivo</h2>
                                    <p className="text-muted-foreground font-bold italic">Panadería Jhoanes - {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 text-right min-w-[240px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Configuración actual</p>
                                    <p className="text-lg font-black">{reportType === 'daily' ? 'Diario' : reportType === 'weekly' ? 'Semanal' : reportType === 'monthly' ? 'Mensual' : 'Personalizado'}</p>
                                    <p className="text-sm font-bold text-primary">{viewMode === 'general' ? 'Reporte General' : viewMode === 'all-clients' ? 'Todos los Clientes' : 'Cliente Específico'}</p>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-muted/10 p-5 rounded-2xl border border-border/40">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Rango de Fechas</p>
                                    <p className="text-sm font-bold mt-1">{startDate} <span className="text-muted-foreground mx-1">/</span> {endDate}</p>
                                </div>
                                <div className="bg-muted/10 p-5 rounded-2xl border border-border/40">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Total Pedidos</p>
                                    <p className="text-sm font-bold mt-1">{orders.length} pedidos procesados</p>
                                </div>
                                {viewMode === 'specific-client' && (
                                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 col-span-2">
                                        <p className="text-[10px] font-black uppercase text-primary">Identificación del Cliente</p>
                                        <p className="text-sm font-bold mt-1">{clients.find(c => c.id === selectedClientId)?.profile?.full_name || 'N/A'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Content Tables */}
                            {(viewMode === 'general' || viewMode === 'specific-client') && (
                                <div className="space-y-16">
                                    {Object.values(processedData.categories).map(cat => (
                                        <div key={cat.name} className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-12 bg-primary rounded-full" />
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground/80">{cat.name}</h3>
                                            </div>
                                            <div className="overflow-hidden rounded-[2rem] border border-border shadow-sm">
                                                <table className="w-full text-left">
                                                    <thead className="bg-muted/20 border-b border-border">
                                                        <tr>
                                                            <th className="py-5 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Producto</th>
                                                            <th className="py-5 px-8 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Desglose Delivery</th>
                                                            <th className="py-5 px-8 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Unidades</th>
                                                            <th className="py-5 px-8 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Monto</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        {Object.values(cat.products).map(prod => (
                                                            <tr key={prod.name} className="hover:bg-muted/10 transition-colors">
                                                                <td className="py-5 px-8 font-black text-sm">{prod.name}</td>
                                                                <td className="py-5 px-8">
                                                                    <div className="flex flex-wrap justify-center gap-2">
                                                                        {Object.entries(prod.deliveryTypes || {}).map(([type, q]) => (
                                                                            <span key={type} className="text-[10px] px-3 py-1 rounded-full bg-muted border border-border font-bold uppercase transition-all hover:border-primary/50">
                                                                                {type}: {q}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="py-5 px-8 text-right font-black text-lg">{prod.quantity}</td>
                                                                <td className="py-5 px-8 text-right text-muted-foreground font-bold">${(prod.quantity * prod.price).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-primary/5">
                                                        <tr>
                                                            <td className="py-6 px-8 font-black text-primary uppercase tracking-widest text-xs">Subtotal {cat.name}</td>
                                                            <td className="py-6 px-8 text-center">
                                                                <span className="text-xs font-bold text-primary/60">{cat.totalQuantity} unidades totales</span>
                                                            </td>
                                                            <td className="py-6 px-8 text-right font-black text-primary text-xl" colSpan={2}>
                                                                ${cat.subtotal.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="bg-black text-white p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center shadow-2xl">
                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Gran Total del Período</p>
                                            <p className="text-neutral-400 text-sm italic">Consolidado final incluyendo todos los productos e impuestos</p>
                                        </div>
                                        <div className="text-6xl font-black tracking-tighter">
                                            ${processedData.total.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'all-clients' && allClientsTableData && (
                                <div className="space-y-16">
                                    <div className="p-8 bg-amber-50 border border-amber-200 rounded-[2.5rem] flex items-center gap-5 text-amber-700">
                                        <div className="w-14 h-14 bg-amber-200 rounded-full flex items-center justify-center shrink-0">
                                            <UsersIcon size={28} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black tracking-tight">Matriz de Distribución por Cliente</p>
                                            <p className="text-sm font-medium opacity-80">Visualiza la cantidad exacta de productos asignada a cada cliente individual.</p>
                                        </div>
                                    </div>
                                    
                                    {Object.values(allClientsTableData).map(catData => (
                                        <div key={catData.category} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-12 bg-primary rounded-full" />
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground/80">{catData.category}</h3>
                                            </div>
                                            
                                            <div className="overflow-x-auto rounded-[2rem] border border-border shadow-lg">
                                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                                    <thead className="bg-muted/30">
                                                        <tr>
                                                            <th className="py-6 px-8 sticky left-0 bg-white border-r border-border shadow-xl z-10 w-80 text-xs font-black uppercase tracking-widest text-muted-foreground">Producto</th>
                                                            {processedData.clientCols.map(client => (
                                                                <th key={client.id} className="py-6 px-6 border-r border-border/50 text-center min-w-[160px]">
                                                                    <div className="truncate font-black text-xs uppercase">{client.name}</div>
                                                                    {client.company && <div className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1 font-bold">{client.company}</div>}
                                                                </th>
                                                            ))}
                                                            <th className="py-6 px-8 border-l-4 border-primary bg-primary/5 font-black text-primary text-xs uppercase text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {Object.entries(catData.products).map(([prodName, prodClients]) => {
                                                            const totalProdQty = Object.values(prodClients).reduce((a, b) => a + b, 0);
                                                            return (
                                                                <tr key={prodName} className="hover:bg-muted/20 transition-colors">
                                                                    <td className="py-6 px-8 sticky left-0 bg-white border-r border-border shadow-xl z-10 font-black text-sm">{prodName}</td>
                                                                    {processedData.clientCols.map(client => (
                                                                        <td key={client.id} className="py-6 px-6 text-center border-r border-border/30 font-bold text-muted-foreground">
                                                                            {prodClients[client.id] || '-'}
                                                                        </td>
                                                                    ))}
                                                                    <td className="py-6 px-8 text-right border-l-4 border-primary bg-primary/5 font-black text-primary text-lg">
                                                                        {totalProdQty}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* History Section (Always Visible) */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-muted rounded-2xl">
                                <FileText className="text-muted-foreground" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Últimos 10 Días</h2>
                                <p className="text-xs font-medium text-muted-foreground italic">Resumen consolidado de unidades por categoría</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-border">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Fecha</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Croissants (Uds)</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Postres (Uds)</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pasteles (Uds)</th>
                                    <th className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Unidades Totales</th>
                                    <th className="py-5 px-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {historyTable.map(([date, data]) => (
                                    <tr key={date} className="hover:bg-muted/20 transition-all hover:scale-[1.002] duration-200">
                                        <td className="py-5 px-8 font-black text-sm">{date}</td>
                                        <td className="py-5 px-8 font-bold text-muted-foreground">{((data as any).Croissants || 0).toLocaleString()} <span className="text-[10px] opacity-60">uds</span></td>
                                        <td className="py-5 px-8 font-bold text-muted-foreground">{((data as any).Postres || 0).toLocaleString()} <span className="text-[10px] opacity-60">uds</span></td>
                                        <td className="py-5 px-8 font-bold text-muted-foreground">{((data as any).Pasteles || 0).toLocaleString()} <span className="text-[10px] opacity-60">uds</span></td>
                                        <td className="py-5 px-8 text-right font-black text-primary text-base">
                                            {((data as any).total || 0).toLocaleString()} <span className="text-[10px] opacity-60">uds</span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => handleViewDayDetail(date)}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all group"
                                                >
                                                    Ver Detalle
                                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {loadingHistory && !historyTable.length && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Loader2 size={32} className="animate-spin mx-auto text-primary opacity-30 mb-4" />
                                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Cargando datos históricos...</p>
                                        </td>
                                    </tr>
                                )}
                                {!loadingHistory && historyTable.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-muted-foreground italic">No se encontraron datos históricos recientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        body { background: white !important; color: black !important; }
                        main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                        .print-hidden { display: none !important; }
                        .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
                        table { page-break-inside: auto; border: 1px solid #eee !important; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        thead { display: table-header-group; }
                    }
                `}</style>
            </main>
        </div>
    );
}
