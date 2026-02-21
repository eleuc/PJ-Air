'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Plus, Edit2, Trash2, Folder, Search, ChevronRight } from 'lucide-react';

const INITIAL_CATEGORIES = [
    { id: 1, name: 'Croissant', count: 12 },
    { id: 2, name: 'Dessert', count: 8 },
    { id: 3, name: 'CakesSlices', count: 15 },
];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="max-w-4xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-2 text-primary">Gestión de Categorías</h1>
                            <p className="text-muted-foreground font-medium">Organiza tus productos para una mejor navegación</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-premium bg-primary text-white flex items-center gap-2"
                        >
                            <Plus size={20} /> Nueva Categoría
                        </button>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-card p-8 rounded-[32px] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
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

                        <button
                            onClick={() => setShowModal(true)}
                            className="border-2 border-dashed border-border rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary transition-all group min-h-[220px]"
                        >
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold text-sm uppercase tracking-widest">Añadir Categoría</span>
                        </button>
                    </div>
                </div>

                {/* Modal simplified */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h2 className="text-2xl font-bold font-serif">Nueva Categoría</h2>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block ml-2">Nombre de la Categoría</label>
                                    <input type="text" placeholder="Ej: Especialidades de Temporada" className="w-full px-6 py-4 bg-muted rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" />
                                </div>
                            </div>
                            <div className="p-8 flex gap-4 bg-muted/10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-muted transition-all rounded-2xl">Cancelar</button>
                                <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
