'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Plus, Trash2, Folder, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface CategorySummary {
    name: string;
    count: number;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const products: any[] = await api.get('/products');

                // Derive categories and counts from real product data
                const categoryMap = products.reduce<Record<string, number>>((acc, p) => {
                    acc[p.category] = (acc[p.category] || 0) + 1;
                    return acc;
                }, {});

                setCategories(
                    Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
                );
            } catch (err: any) {
                setError(err.message || 'No se pudieron cargar las categorías');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="max-w-4xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-2 text-primary">Gestión de Categorías</h1>
                            <p className="text-muted-foreground font-medium">
                                {loading ? 'Cargando categorías...' : `${categories.length} categorías activas`}
                            </p>
                        </div>
                        <button className="btn-premium bg-primary text-white flex items-center gap-2">
                            <Plus size={20} /> Nueva Categoría
                        </button>
                    </header>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="font-medium">Cargando categorías...</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                            <AlertCircle size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Category Cards */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat.name} className="bg-card p-8 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                        <Folder size={28} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{cat.count} Productos</p>

                                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                                        <button className="flex-1 py-3 bg-muted hover:bg-border rounded-xl text-xs font-bold transition-all text-foreground/70">Editar</button>
                                        <button className="p-3 bg-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-foreground/70">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
