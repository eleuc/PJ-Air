'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Plus, Trash2, Folder, Loader2, AlertCircle, X, Save, Edit2, CheckCircle2, Package, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

interface CategorySummary {
    id: number;
    name: string;       // Spanish name (master key used in DB)
    name_en: string;    // English name
    count: number;
    min_qty: number;
}

export default function AdminCategoriesPage() {
    const { t, locale } = useLanguage();
    const [categories, setCategories] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);
    const [catName, setCatName] = useState('');
    const [catNameEn, setCatNameEn] = useState('');
    const [minQty, setMinQty] = useState<number>(1);
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
            
            // Fetch real categories from backend
            const cats = await api.get('/products/categories') as any[];
            
            // Fetch products to count them
            const products = await api.get('/products') as any[];

            // Build counts
            const counts: Record<number, number> = {};
            products.forEach(p => {
                const catId = p.category?.id;
                if (catId) {
                    counts[catId] = (counts[catId] || 0) + 1;
                }
            });

            setCategories(
                cats.map(c => ({
                    id: c.id,
                    name: c.name,
                    name_en: c.name_en || c.name,
                    min_qty: c.min_qty || 1,
                    count: counts[c.id] || 0,
                })).sort((a, b) => a.name.localeCompare(b.name))
            );
        } catch (err: any) {
            setError(err.message || 'Could not load categories');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingCategory(null);
        setCatName('');
        setCatNameEn('');
        setMinQty(1);
        setFormError(null);
        setShowModal(true);
    };

    const openEdit = (cat: CategorySummary) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatNameEn(cat.name_en);
        setMinQty(cat.min_qty || 1);
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        const trimmedEs = catName.trim();
        const trimmedEn = catNameEn.trim();
        if (!trimmedEs) { setFormError('El nombre en español no puede estar vacío.'); return; }
        if (!trimmedEn) { setFormError('The English name cannot be empty.'); return; }

        if (!editingCategory && categories.find(c => c.name.toLowerCase() === trimmedEs.toLowerCase())) {
            setFormError('Ya existe una categoría con ese nombre.');
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            if (editingCategory) {
                await api.patch(`/products/categories/${editingCategory.id}`, {
                    name: trimmedEs,
                    name_en: trimmedEn,
                    min_qty: minQty
                });
                showToast(`✅ Category updated: "${trimmedEs}" (Min: ${minQty})`);
            } else {
                await api.post('/products/categories', {
                    name: trimmedEs,
                    name_en: trimmedEn,
                    min_qty: minQty
                });
                showToast(`✅ Category "${trimmedEs}" / "${trimmedEn}" created`);
            }
            await fetchCategories();
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message || 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await api.delete(`/products/categories/${deleteConfirm.id}`);
            setDeleteConfirm(null);
            await fetchCategories();
            showToast(`🗑️ Category "${deleteConfirm.name}" deleted`);
        } catch (err: any) {
            showToast(err.message || 'Error deleting', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">
                                {t.adminSidebar.categories}
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                {loading ? t.common.loading : `${categories.length} ${t.adminSidebar.categories.toLowerCase()}`}
                            </p>
                        </div>
                        <button onClick={openCreate} className="btn-premium bg-primary text-white flex items-center gap-2">
                            <Plus size={20} /> {locale === 'en' ? 'New Category' : 'Nueva Categoría'}
                        </button>
                    </header>

                    {loading && (
                        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="font-medium">{t.common.loading}</span>
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
                            <p className="font-medium text-muted-foreground mb-4">No categories yet.</p>
                            <button onClick={openCreate} className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm">Create first category</button>
                        </div>
                    )}

                    {!loading && !error && categories.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-card p-8 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-[32px]" />
                                    <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                        <Folder size={28} />
                                    </div>
                                    <div className="mb-1">
                                        <h3 className="text-xl font-bold leading-tight">{cat.name}</h3>
                                        {cat.name_en && cat.name_en !== cat.name && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Globe size={11} className="text-muted-foreground/50" />
                                                <span className="text-xs text-muted-foreground font-medium italic">{cat.name_en}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-widest mt-3">
                                        <Package size={12} />
                                        <span>{cat.count} {cat.count === 1 ? 'product' : 'products'}{cat.count === 0 ? ' · New' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                                        <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all text-foreground/70">
                                            <Edit2 size={14} /> {t.common.edit}
                                        </button>
                                        <button onClick={() => setDeleteConfirm(cat)} className="p-3 bg-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-foreground/70">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <CheckCircle2 size={20} />{toast.msg}
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {editingCategory
                                        ? `Editing: "${editingCategory.name}"`
                                        : 'Add a bilingual category to the catalog'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-5">
                            {formError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={16} /> {formError}
                                </div>
                            )}

                            {/* Spanish name */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase mb-1.5">
                                    🇪🇸 Nombre en Español *
                                </label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    placeholder="Ej: Croissants, Postres, Pasteles..."
                                    autoFocus
                                    className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                />
                            </div>

                            {/* English name */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase mb-1.5">
                                    🇺🇸 Name in English *
                                </label>
                                <input
                                    type="text"
                                    value={catNameEn}
                                    onChange={e => setCatNameEn(e.target.value)}
                                    placeholder="e.g: Croissants, Desserts, Cakes..."
                                    className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                />
                            </div>

                            {/* Min Quantity */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase mb-1.5">
                                    📦 Cantidad Mínima / Min Quantity
                                </label>
                                <input
                                    type="number"
                                    value={minQty}
                                    onChange={e => setMinQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1.5 italic">Garantiza un pedido mínimo para esta categoría.</p>
                            </div>

                            {editingCategory && editingCategory.count > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
                                    <AlertCircle size={15} />
                                    <span>This will update <strong>{editingCategory.count} products</strong> in this category.</span>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-muted/10 flex gap-4 border-t border-border">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl">
                                {t.common.cancel}
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl disabled:opacity-60">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? t.common.loading : editingCategory ? t.common.save : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-8 text-center border-b border-border">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                            <h2 className="text-xl font-bold mb-2">Delete category?</h2>
                            <p className="text-muted-foreground text-sm">
                                <strong>"{deleteConfirm.name}"</strong>
                                {deleteConfirm.count > 0
                                    ? ` has ${deleteConfirm.count} products. They will be moved to "Uncategorized".`
                                    : ' has no associated products.'}
                            </p>
                        </div>
                        <div className="p-6 flex gap-4">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl">{t.common.cancel}</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white font-bold rounded-2xl disabled:opacity-60">
                                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {deleting ? 'Deleting...' : t.common.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
