'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { LayoutGrid, List, Plus, Search, Edit2, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
}

export default function AdminProductsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.get('/products');
                setProducts(data);
            } catch (err: any) {
                setError(err.message || 'No se pudieron cargar los productos');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
                        <p className="text-muted-foreground">
                            {loading ? 'Cargando catálogo...' : `${products.length} productos en el catálogo`}
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-white btn-premium">
                        <Plus size={20} /> Añadir Producto
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-card p-4 rounded-2xl border border-border flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-muted p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span className="font-medium">Cargando productos...</span>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all">
                                <div className="h-40 overflow-hidden relative group bg-muted/30">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white"><Edit2 size={16} /></button>
                                        <button className="p-2 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{product.category}</span>
                                    <h3 className="font-bold truncate">{product.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && viewMode === 'list' && (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Imagen</th>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4">Precio</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(product => (
                                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <img
                                                src={product.image}
                                                className="w-12 h-12 rounded-lg object-cover bg-muted/30"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-primary">${Number(product.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={18} /></button>
                                                <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><ImageIcon size={18} /></button>
                                                <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="font-medium">No se encontraron productos para "{searchQuery}"</p>
                    </div>
                )}
            </main>
        </div>
    );
}
