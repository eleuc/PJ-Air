'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Plus, Trash2, Folder, Loader2, AlertCircle, X, Save, Edit2, CheckCircle2, Package } from 'lucide-react';
import { api } from '@/lib/api';

interface CategorySummary {
    name: string;
    count: number;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);
    const [catName, setCatName] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<CategorySummary | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchCategories(); }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const products: any[] = await api.get('/products');
            const map = products.reduce<Record<string, number>>((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
            }, {});
            setCategories(Object.entries(map).map(([name, count]) => ({ name, count })));
        } catch (err: any) {
            setError(err.message || 'No se pudieron cargar las categorías');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingCategory(null);
        setCatName('');
        setFormError(null);
        setShowModal(true);
    };

    const openEdit = (cat: CategorySummary) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        const trimmed = catName.trim();
        if (!trimmed) { setFormError('El nombre de la categoría no puede estar vacío.'); return; }

        if (!editingCategory && categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            setFormError('Ya existe una categoría con ese nombre.');
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            if (editingCategory) {
                // Rename category: update all products with old category name
                const products: any[] = await api.get('/products');
                const affected = products.filter(p => p.category === editingCategory.name);
                await Promise.all(
                    affected.map(p => api.patch(`/products/${p.id}`, { category: trimmed }))
                );
                setCategories(prev =>
                    prev.map(c => c.name === editingCategory.name ? { name: trimmed, count: c.count } : c)
                );
                showToast(`✅ Categoría renombrada a "${trimmed}"`);
            } else {
                // New category — just add it to local state (it becomes real when a product uses it)
                setCategories(prev => [...prev, { name: trimmed, count: 0 }]);
                showToast(`✅ Categoría "${trimmed}" creada`);
            }
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message || 'Error al guardar la categoría');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            // Remove category from products (set to empty or reassign)
            const products: any[] = await api.get('/products');
            const affected = products.filter(p => p.category === deleteConfirm.name);
            if (affected.length > 0) {
                await Promise.all(
                    affected.map(p => api.patch(`/products/${p.id}`, { category: 'Sin categoría' }))
                );
            }
            setCategories(prev => prev.filter(c => c.name !== deleteConfirm.name));
            setDeleteConfirm(null);
            showToast(`🗑️ Categoría "${deleteConfirm.name}" eliminada`);
        } catch (err: any) {
            showToast(err.message || 'Error al eliminar la categoría', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Gestión de Categorías</h1>
                            <p className="text-muted-foreground font-medium">
                                {loading ? 'Cargando...' : `${categories.length} categorías activas`}
                            </p>
                        </div>
                        <button onClick={openCreate} className="btn-premium bg-primary text-white flex items-center gap-2">
                            <Plus size={20} /> Nueva Categoría
                        </button>
                    </header>

                    {loading && (
                        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="font-medium">Cargando categorías...</span>
                        </div>
                    )}
                    {error && !loading && (
                        <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                            <AlertCircle size={20} /><span className="font-medium">{error}</span>
                        </div>
                    )}

                    {!loading && !error && categories.length === 0 && (
                        <div className="text-center py-20 bg-card rounded-2xl border border-border">
                            <Folder size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                            <p className="font-medium text-muted-foreground mb-4">No hay categorías aún.</p>
                            <button onClick={openCreate} className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm">Crear primera categoría</button>
                        </div>
                    )}

                    {!loading && !error && categories.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat.name} className="bg-card p-8 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-[32px]" />

                                    <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                        <Folder size={28} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-widest">
                                        <Package size={12} />
                                        <span>{cat.count} Productos</span>
                                    </div>

                                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                                        <button
                                            onClick={() => openEdit(cat)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all text-foreground/70"
                                        >
                                            <Edit2 size={14} /> Renombrar
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(cat)}
                                            className="p-3 bg-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-foreground/70"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* ─── TOAST ─── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <CheckCircle2 size={20} />{toast.msg}
                </div>
            )}

            {/* ─── CREATE / EDIT MODAL ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold">{editingCategory ? 'Renombrar Categoría' : 'Nueva Categoría'}</h2>
                                <p className="text-sm text-muted-foreground">{editingCategory ? `Actualmente: "${editingCategory.name}"` : 'Añade una nueva categoría al catálogo'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-all"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-4">
                            {formError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={16} /> {formError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase mb-1.5">Nombre de la Categoría *</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    placeholder="Ej: Croissants, Postres, Pasteles..."
                                    autoFocus
                                    className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                            {editingCategory && editingCategory.count > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
                                    <AlertCircle size={15} />
                                    <span>Se actualizarán los <strong>{editingCategory.count} productos</strong> de esta categoría.</span>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-muted/10 flex gap-4 border-t border-border">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all disabled:opacity-60">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Guardando...' : editingCategory ? 'Renombrar' : 'Crear Categoría'}
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
                            <h2 className="text-xl font-bold mb-2">¿Eliminar categoría?</h2>
                            <p className="text-muted-foreground text-sm">
                                La categoría <strong>"{deleteConfirm.name}"</strong> tiene <strong>{deleteConfirm.count} productos</strong>.
                                {deleteConfirm.count > 0 && ' Serán movidos a "Sin categoría".'}
                            </p>
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
