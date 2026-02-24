'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Link from 'next/link';
import { ShoppingBag, Layers, Users, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
    const [statsData, setStatsData] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [products, users, orders] = await Promise.all([
                    api.get('/products'),
                    api.get('/users'),
                    api.get('/orders')
                ]);

                // Calculate unique categories from products
                const categories = products ? Array.from(new Set(products.map((p: any) => p.category))).length : 0;

                setStatsData({
                    products: products?.length || 0,
                    categories: categories,
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
    }, []);

    const stats = [
        { label: 'Productos', value: loading ? '...' : statsData.products, icon: ShoppingBag, href: '/admin/products', color: 'text-primary bg-primary/10' },
        { label: 'Categorías', value: loading ? '...' : statsData.categories, icon: Layers, href: '/admin/categories', color: 'text-violet-600 bg-violet-50' },
        { label: 'Usuarios', value: loading ? '...' : statsData.users, icon: Users, href: '/admin/users', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Pedidos', value: loading ? '...' : statsData.orders, icon: TrendingUp, href: '/admin/orders', color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
                <p className="text-muted-foreground mb-10">Bienvenido al panel de control de Panadería Jhoanes.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href} className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all group">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-8 rounded-2xl border border-border">
                        <h2 className="font-bold text-lg mb-4">Accesos Rápidos</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Añadir nuevo producto', href: '/admin/products' },
                                { label: 'Ver categorías', href: '/admin/categories' },
                                { label: 'Gestionar usuarios', href: '/admin/users' },
                            ].map(item => (
                                <Link key={item.href} href={item.href} className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-primary/10 transition-all group">
                                    <span className="font-semibold text-sm">{item.label}</span>
                                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                            <TrendingUp size={32} />
                        </div>
                        <h2 className="font-bold text-lg mb-2">Estadísticas próximamente</h2>
                        <p className="text-muted-foreground text-sm">Las métricas de ventas y pedidos en tiempo real estarán disponibles aquí.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
