'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
    Search, Plus, Edit2, Trash2, X, Loader2, Save, Package, Upload, Image as ImageIcon
} from 'lucide-react';
import { api, API_URL } from '@/lib/api';

/* ─── Types ─── */
interface Product {
    id: number;
    name: string;
    category: string;
    category_en?: string;
    price: number;
    description: string;
    image: string;
    category_min_qty?: number;
}

interface ProductForm {
    name: string;
    category: string;
    category_en: string;
    price: string;
    description: string;
    image: string;
    category_min_qty: string;
}



const emptyForm: ProductForm = {
    name: '',
    category: '',
    category_en: '',
    price: '',
    description: '',
    image: '',
    category_min_qty: '1',
};

/* ═══════════════════════════════════════════════════════════════
   PAGE: Productos2
   ═══════════════════════════════════════════════════════════════ */
export default function Productos2Page() {
    /* ── state ── */
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // modal
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // image upload
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // toast
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    /* ── fetch ── */
    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = (await api.get('/products')) as Product[];
            setProducts(data || []);
        } catch (err: any) {
            setError(err.message || 'No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    /* ── helpers ── */
    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

    const filtered = products.filter(p => {
        const matchSearch = !searchQuery
            || p.name.toLowerCase().includes(searchQuery.toLowerCase())
            || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = !selectedCategory || p.category === selectedCategory;
        return matchSearch && matchCat;
    });

    /* ── CRUD actions ── */
    const openCreate = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setImagePreview(null);
        setFormError(null);
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setForm({
            name: p.name,
            category: p.category,
            category_en: p.category_en || '',
            price: String(p.price),
            description: p.description || '',
            image: p.image || '',
            category_min_qty: String(p.category_min_qty ?? 1),
        });
        setImagePreview(p.image || null);
        setFormError(null);
        setShowModal(true);
    };

    const handleImageUpload = async (file: File) => {
        // Show instant local preview
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const data = await api.upload('/products/upload-image', fd) as { url: string };
            // Replace preview with real server path
            setForm(f => ({ ...f, image: data.url }));
            setImagePreview(data.url);
            showToast('📸 Imagen subida correctamente');
        } catch {
            // Keep local preview but warn
            showToast('⚠️ Error al subir imagen. Se usará la previsualización local.', 'err');
            setForm(f => ({ ...f, image: localUrl }));
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
                category: form.category.trim(),
                category_en: form.category_en.trim() || form.category.trim(),
                price,
                description: form.description.trim(),
                image: form.image.trim(),
                category_min_qty: parseInt(form.category_min_qty) || 1,
            };

            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id}`, payload);
                showToast('✅ Producto actualizado');
            } else {
                await api.post('/products', payload);
                showToast('✅ Producto creado');
            }

            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            setFormError(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (p: Product) => {
        setDeleting(true);
        try {
            await api.delete(`/products/${p.id}`);
            showToast('🗑️ Producto eliminado');
            setDeleteConfirm(null);
            fetchProducts();
        } catch (err: any) {
            showToast(err.message || 'Error al eliminar', 'err');
        } finally {
            setDeleting(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />

            <main className="flex-1 p-8">
                {/* ── Header ── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight">Productos 2</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestión de productos del catálogo
                    </p>
                </div>

                {/* ── Toolbar: search + category + add ── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Category filter */}
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Add button */}
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Plus size={18} /> Nuevo producto
                    </button>
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="animate-spin text-primary" size={36} />
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center text-sm font-bold">
                        {error}
                        <button onClick={fetchProducts} className="ml-3 underline hover:no-underline">Reintentar</button>
                    </div>
                )}

                {/* ── Grid ── */}
                {!loading && !error && (
                    <>
                        <p className="text-xs text-muted-foreground mb-4 font-medium">
                            {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                        </p>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <Package size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No se encontraron productos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {filtered.map(product => (
                                    <div
                                        key={product.id}
                                        className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square bg-muted/30 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image?.startsWith('http') ? product.image : `${API_URL}${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={e => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center text-muted-foreground/20 absolute inset-0 ${product.image ? 'hidden' : ''}`}>
                                                <Package size={36} />
                                            </div>

                                            {/* Hover overlay with edit / delete */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="p-2.5 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(product)}
                                                    className="p-2.5 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <p className="text-sm font-bold truncate">{product.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{product.category}</p>
                                            <p className="text-lg font-black mt-1">${Number(product.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ═══ CREATE / EDIT MODAL ═══ */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
                    >
                        <div className="bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                                <h2 className="text-xl font-black">
                                    {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal body */}
                            <div className="p-6 space-y-5">
                                {/* Error */}
                                {formError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
                                        {formError}
                                    </div>
                                )}

                                {/* Image upload */}
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Imagen</label>
                                    <div className="flex items-start gap-4">
                                        {/* Preview box */}
                                        <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0 relative">
                                            {(imagePreview || form.image) ? (
                                                <img
                                                    src={imagePreview?.startsWith('http') || imagePreview?.startsWith('blob:') ? imagePreview : `${API_URL}${imagePreview}`}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <ImageIcon size={28} className="text-muted-foreground/30" />
                                            )}
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                    <Loader2 className="animate-spin text-primary" size={22} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Upload button + url field */}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file);
                                                    e.target.value = '';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingImage}
                                                className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all disabled:opacity-50"
                                            >
                                                <Upload size={14} /> Subir imagen
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="O pegar URL de imagen"
                                                value={form.image}
                                                onChange={e => {
                                                    setForm(f => ({ ...f, image: e.target.value }));
                                                    setImagePreview(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/50 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Nombre *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Ej: Croissant de Almendra"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Category ES */}
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Categoría (ES) *</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        placeholder="Ej: Croissants"
                                        list="categories-list"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <datalist id="categories-list">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>

                                {/* Category EN */}
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Categoría (EN)</label>
                                    <input
                                        type="text"
                                        value={form.category_en}
                                        onChange={e => setForm(f => ({ ...f, category_en: e.target.value }))}
                                        placeholder="Ej: Croissants"
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Price + Min Qty (row) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Precio ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.price}
                                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Mínimo x cat.</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.category_min_qty}
                                            onChange={e => setForm(f => ({ ...f, category_min_qty: e.target.value }))}
                                            placeholder="1"
                                            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground/60 mb-2 block">Descripción</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Descripción breve del producto..."
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ DELETE CONFIRM ═══ */}
                {deleteConfirm && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
                    >
                        <div className="bg-card rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-black mb-2">¿Eliminar producto?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Se eliminará <strong>{deleteConfirm.name}</strong> de forma permanente.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ TOAST ═══ */}
                {toast && (
                    <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-fade-in ${toast.type === 'ok' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {toast.msg}
                    </div>
                )}
            </main>
        </div>
    );
}
