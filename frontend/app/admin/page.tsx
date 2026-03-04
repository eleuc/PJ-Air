'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Layers, Users, TrendingUp, ArrowRight, Loader2, FileText, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboardPage() {
    const { t } = useLanguage();
    const router = useRouter();

    const [statsData, setStatsData] = useState({ products: 0, categories: 0, users: 0, orders: 0 });
    const [loading, setLoading] = useState(true);

    // Last 10 days history
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [products, users, orders] = await Promise.all([
                    api.get('/products'),
                    api.get('/users'),
                    api.get('/orders')
                ]);
                const categories = products ? Array.from(new Set(products.map((p: any) => p.category))).length : 0;
                setStatsData({
                    products: products?.length || 0,
                    categories,
                    users: users?.length || 0,
                    orders: orders?.length || 0
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        const fetchHistory = async () => {
            try {
                const end = new Date();
                const start = new Date();
                const endStr = end.toISOString().split('T')[0] + ' 23:59:59';
                const startStr = start.toISOString().split('T')[0] + ' 00:00:00';
                const url = `http://localhost:3001/orders/reports/range?startDate=${startStr}&endDate=${endStr}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setHistoryOrders(Array.isArray(data) ? data : []);
            } catch {
                console.error('Error fetching history');
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    // Process history into daily summaries
    const historyTable = useMemo(() => {
        const days: Record<string, Record<string, number>> = {};
        historyOrders.forEach(order => {
            const date = (order.delivery_date || order.created_at || '').split('T')[0];
            if (!date) return;
            if (!days[date]) days[date] = { total: 0 };
            (order.items || []).forEach((item: any) => {
                const cat = item.product?.category || 'Otros';
                const qty = Number(item.quantity) || 0;
                days[date][cat] = (days[date][cat] || 0) + qty;
                days[date].total += qty;
            });
        });
        return Object.entries(days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10);
    }, [historyOrders]);

    const allCategories = useMemo(() => {
        return [...new Set(historyOrders.flatMap(o => (o.items || []).map((it: any) => it.product?.category || 'Otros')))];
    }, [historyOrders]);

    const stats = [
        { label: t.admin.products, value: loading ? '...' : statsData.products, icon: ShoppingBag, href: '/admin/products', color: 'text-primary bg-primary/10' },
        { label: t.admin.categories, value: loading ? '...' : statsData.categories, icon: Layers, href: '/admin/categories', color: 'text-violet-600 bg-violet-50' },
        { label: t.admin.users, value: loading ? '...' : statsData.users, icon: Users, href: '/admin/users', color: 'text-emerald-600 bg-emerald-50' },
        { label: t.admin.orders, value: loading ? '...' : statsData.orders, icon: TrendingUp, href: '/admin/orders', color: 'text-amber-600 bg-amber-50' },
    ];

    const handleViewDayDetail = (date: string) => {
        // Navigate to reports page with date params
        router.push(`/admin/reports?date=${date}`);
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-black mb-1">{t.admin.dashboardTitle}</h1>
                    <p className="text-muted-foreground">{t.admin.dashboardSubtitle}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href} className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all group hover:border-primary/30">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="text-3xl font-black mb-1">{stat.value}</div>
                                <div className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
                                    {stat.label}
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Access + Reports Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-8 rounded-2xl border border-border">
                        <h2 className="font-black text-lg mb-4">{t.admin.quickAccess}</h2>
                        <div className="space-y-3">
                            {[
                                { label: t.admin.addProduct, href: '/admin/products' },
                                { label: t.admin.viewCategories, href: '/admin/categories' },
                                { label: t.admin.manageUsers, href: '/admin/users' },
                                { label: 'Ver Reportes Completos', href: '/admin/reports' },
                            ].map(item => (
                                <Link key={item.href} href={item.href} className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-primary/10 transition-all group">
                                    <span className="font-semibold text-sm">{item.label}</span>
                                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Last 10 days Summary */}
                    <div className="md:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <FileText className="text-primary" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-base">Historial de Reportes</h2>
                                    <p className="text-xs text-muted-foreground">Últimos 10 días — unidades por categoría</p>
                                </div>
                            </div>
                            <Link href="/admin/reports" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                Ver todo <ChevronRight size={14} />
                            </Link>
                        </div>

                        {loadingHistory ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={28} className="animate-spin text-primary/30" />
                            </div>
                        ) : historyTable.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <Calendar size={32} className="mb-3 opacity-30" />
                                <p className="text-sm font-semibold">Sin datos recientes</p>
                                <p className="text-xs">Genera reportes para ver el historial aquí</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/20 border-b border-border">
                                        <tr>
                                            <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                            {allCategories.map(cat => (
                                                <th key={cat} className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat}</th>
                                            ))}
                                            <th className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                                            <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {historyTable.map(([date, data]) => (
                                            <tr key={date} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-3 px-5 font-black text-sm whitespace-nowrap">{date}</td>
                                                {allCategories.map(cat => (
                                                    <td key={cat} className="py-3 px-4 text-sm font-bold text-muted-foreground">
                                                        {((data as any)[cat] || 0)} <span className="text-[10px] opacity-50">uds</span>
                                                    </td>
                                                ))}
                                                <td className="py-3 px-4 text-right font-black text-primary text-sm whitespace-nowrap">
                                                    {((data as any).total || 0)} <span className="text-[10px] font-bold opacity-60">uds</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleViewDayDetail(date)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all group"
                                                        >
                                                            Ver Detalle
                                                            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
