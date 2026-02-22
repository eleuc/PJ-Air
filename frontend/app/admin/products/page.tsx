'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
    LayoutGrid, List, Plus, Search, Edit2, Trash2, X,
    Loader2, AlertCircle, Save, Package, Upload, CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
}

interface ProductForm {
    name: string;
    category: string;
    price: string;
    description: string;
    image: string;
}

const CATEGORIES = ['Croissants', 'Postres', 'Pasteles'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const emptyForm: ProductForm = {
    name: '', category: 'Croissants', price: '', description: '', image: ''
};

export default function AdminProductsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Image upload
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchProducts(); }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/products');
            setProducts(data || []);
        } catch (err: any) {
            setError(err.message || 'No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setFormError(null);
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setForm({
            name: p.name,
            category: p.category,
            price: String(p.price),
            description: p.description || '',
            image: p.image || '',
        });
        setFormError(null);
        setShowModal(true);
    };

    // Image upload via file input
    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_BASE}/products/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Error al subir imagen');
            const data = await res.json();
            setForm(f => ({ ...f, image: data.url }));
        } catch (err: any) {
            // Fallback: use a local object URL preview
            const objectUrl = URL.createObjectURL(file);
            setForm(f => ({ ...f, image: objectUrl }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.price || !form.category) {
            setFormError('Nombre, categoría y precio son obligatorios.');
            return;
        }
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) {
            setFormError('El precio debe ser un número positivo.');
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            const payload = {
                name: form.name.trim(),
                category: form.category,
                price,
                description: form.description.trim(),
                image: form.image.trim(),
            };

            if (editingProduct) {
                const updated = await api.patch(`/products/${editingProduct.id}`, payload);
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
                showToast('✅ Producto actualizado correctamente');
            } else {
                const created = await api.post('/products', payload);
                setProducts(prev => [...prev, created]);
                showToast('✅ Producto creado correctamente');
            }
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message || 'Error al guardar el producto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await api.delete(`/products/${deleteConfirm.id}`);
            setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
            setDeleteConfirm(null);
            showToast('🗑️ Producto eliminado');
        } catch (err: any) {
            showToast(err.message || 'Error al eliminar el producto', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
                        <p className="text-muted-foreground">
                            {loading ? 'Cargando catálogo...' : `${products.length} productos en el catálogo`}
                        </p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white btn-premium">
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
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-muted-foreground'}`}><List size={20} /></button>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span className="font-medium">Cargando productos...</span>
                    </div>
                )}
                {error && !loading && (
                    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 mb-6">
                        <AlertCircle size={20} /><span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Grid View */}
                {!loading && !error && viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group">
                                <div className="h-40 overflow-hidden relative bg-muted/30">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package size={40} /></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button onClick={() => openEdit(product)} className="p-2.5 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-lg"><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteConfirm(product)} className="p-2.5 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{product.category}</span>
                                    <h3 className="font-bold truncate mt-0.5">{product.name}</h3>
                                    {product.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>}
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="font-bold text-primary text-lg">${Number(product.price).toFixed(2)}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(product)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => setDeleteConfirm(product)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
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
                                    <tr key={product.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4">
                                            {product.image ? (
                                                <img src={product.image} className="w-12 h-12 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/30"><Package size={20} /></div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold">{product.name}</p>
                                            {product.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</p>}
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold">{product.category}</span></td>
                                        <td className="px-6 py-4 font-bold text-primary">${Number(product.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(product)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 size={18} /></button>
                                                <button onClick={() => setDeleteConfirm(product)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border">
                        <Package size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                        <p className="font-medium text-muted-foreground">{searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay productos.'}</p>
                        {!searchQuery && <button onClick={openCreate} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold text-sm">Añadir primero</button>}
                    </div>
                )}
            </main>

            {/* ─── TOAST ─── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <CheckCircle2 size={20} />
                    {toast.msg}
                </div>
            )}

            {/* ─── CREATE / EDIT MODAL ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
                            <div>
                                <h2 className="text-2xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                <p className="text-sm text-muted-foreground">{editingProduct ? `ID: ${editingProduct.id}` : 'Completa los datos del producto'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-all"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-5 max-h-[65vh] overflow-y-auto">
                            {formError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={16} /> {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Nombre del Producto *</label>
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Croissant de Mantequilla" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Categoría *</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Precio ($) *</label>
                                    <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Descripción</label>
                                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción breve del producto..." className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none" />
                                </div>

                                {/* Image Section */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Imagen del Producto</label>

                                    {/* Image preview */}
                                    {form.image && (
                                        <div className="mb-3 w-full h-40 rounded-xl overflow-hidden border border-border bg-muted/30 relative">
                                            <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-border rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                        >
                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(file);
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={form.image}
                                            onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                            placeholder="O pega una URL de imagen..."
                                            className="flex-1 px-4 py-2.5 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-muted/10 flex gap-4 border-t border-border">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all disabled:opacity-60">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRM ─── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-8 text-center border-b border-border">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                            <h2 className="text-xl font-bold mb-2">¿Eliminar producto?</h2>
                            <p className="text-muted-foreground text-sm">Estás a punto de eliminar <strong>"{deleteConfirm.name}"</strong>. Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="p-6 flex gap-4">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all">Cancelar</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all disabled:opacity-60">
                                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
