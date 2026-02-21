'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Package, Clock, CheckCircle2, Eye, Filter, Search, ChevronDown, ListFilter, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['Pedido', 'En Producción', 'Finalizado', 'En Entrega', 'Entregado'];

const MOCK_PRODUCTION_ORDERS = [
    { id: '1001', date: '2026-02-19 08:30 AM', client: 'Juan Pérez', status: 'Pedido', total: 12.00 },
    { id: '0998', date: '2026-02-18 04:15 PM', client: 'María García', status: 'En Producción', total: 45.00 },
    { id: '0995', date: '2026-02-18 10:00 AM', client: 'Carlos Ruiz', status: 'Finalizado', total: 22.50 },
];

export default function BakerPanel() {
    const [orders, setOrders] = useState(MOCK_PRODUCTION_ORDERS);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    const updateStatus = (id: string, newStatus: string) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pedido': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'En Producción': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Finalizado': return 'bg-green-100 text-green-700 border-green-200';
            case 'En Entrega': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Entregado': return 'bg-primary/10 text-primary border-primary/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f3f5]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-primary">Panel de Repostería</h1>
                        <p className="text-muted-foreground font-medium">Gestión de producción y estados de pedidos</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            Pedidos Activos
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            Historial de Producción
                        </button>
                    </div>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-card p-6 rounded-[28px] border border-border flex items-center gap-4 shadow-sm">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">3</div>
                        <div><p className="text-xs font-black text-muted-foreground uppercase">Nuevos Pedidos</p><p className="font-bold">Prioridad alta</p></div>
                    </div>
                    <div className="bg-card p-6 rounded-[28px] border border-border flex items-center gap-4 shadow-sm">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black">5</div>
                        <div><p className="text-xs font-black text-muted-foreground uppercase">En Horno</p><p className="font-bold">Proceso activo</p></div>
                    </div>
                    <div className="bg-card p-6 rounded-[28px] border border-border flex items-center gap-4 shadow-sm">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">12</div>
                        <div><p className="text-xs font-black text-muted-foreground uppercase">Finalizados Hoy</p><p className="font-bold">Listos para delivery</p></div>
                    </div>
                </div>

                {/* List controls */}
                <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden mb-12">
                    <div className="p-8 border-b border-border flex flex-col md:flex-row gap-6 justify-between items-center bg-muted/10">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input type="text" placeholder="Buscar por cliente, pedido o producto..." className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium" />
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-4 bg-white border border-border rounded-2xl font-bold text-sm hover:bg-muted transition-all">
                                <Filter size={18} /> Filtrar por Fecha
                            </button>
                            <button className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-black transition-all">
                                <ListFilter size={18} /> Exportar
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                <tr>
                                    <th className="px-10 py-6">ID Pedido</th>
                                    <th className="px-10 py-6">Fecha y Hora</th>
                                    <th className="px-10 py-6">Cliente</th>
                                    <th className="px-10 py-6">Estado</th>
                                    <th className="px-10 py-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-10 py-8">
                                            <span className="font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg text-sm">#{order.id}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-foreground">{order.date}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-foreground">{order.client}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="relative inline-block group/select">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`appearance-none pl-4 pr-10 py-2 rounded-full border text-xs font-black uppercase tracking-wider cursor-pointer outline-none focus:ring-4 transition-all ${getStatusStyle(order.status)}`}
                                                >
                                                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-muted text-foreground rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.length === 0 && (
                        <div className="py-20 text-center">
                            <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                            <p className="font-bold text-muted-foreground text-lg">No hay pedidos pendientes por el momento</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
