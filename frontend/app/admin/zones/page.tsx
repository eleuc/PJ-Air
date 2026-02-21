'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { MapPin, Plus, Edit2, Trash2, Search, Globe, ChevronRight } from 'lucide-react';

const MOCK_ZONES = [
    { id: 1, name: 'Norte', description: 'Cubre sectores desde el centro hasta la salida norte.' },
    { id: 2, name: 'Centro', description: 'Casco histórico y zonas empresariales.' },
    { id: 3, name: 'Este', description: 'Zonas residenciales y centros comerciales del este.' },
];

export default function AdminZonesPage() {
    const [zones, setZones] = useState(MOCK_ZONES);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="max-w-5xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-2">Administración de Zonas</h1>
                            <p className="text-muted-foreground">Define las áreas de cobertura para el servicio de delivery</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-primary text-white btn-premium"
                        >
                            <Plus size={20} /> Crear Nueva Zona
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zones.map(zone => (
                            <div key={zone.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-secondary text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{zone.name}</h3>
                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{zone.description}</p>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={18} /></button>
                                        <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                        Ver Rutas <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-dashed border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all group min-h-[220px]"
                        >
                            <div className="p-3 bg-muted rounded-full group-hover:bg-primary group-hover:text-white transition-all"><Plus size={24} /></div>
                            <span className="font-bold">Añadir otra zona</span>
                        </button>
                    </div>
                </div>

                {/* Simplistic Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-8 border-b border-border">
                                <h2 className="text-2xl font-bold">Nueva Zona</h2>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Nombre de la Zona</label>
                                    <input type="text" placeholder="Ej: Zona Metropolitana" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Descripción</label>
                                    <textarea placeholder="Detalles de cobertura..." className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20" rows={3} />
                                </div>
                            </div>
                            <div className="p-8 flex gap-4 bg-muted/20">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-muted-foreground">Cancelar</button>
                                <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg">Crear Zona</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
