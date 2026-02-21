'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { MapPin, Plus, Trash2, Home, Briefcase, Map as MapIcon, ChevronRight } from 'lucide-react';

const MOCK_ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];

export default function AddressesPage() {
    const [addresses, setAddresses] = useState([
        { id: 1, name: 'Casa', address: 'Calle Los Jabillos, Qta. La Milagrosa', zone: 'Norte', notes: 'Portón blanco' },
    ]);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-primary">Mis Direcciones</h1>
                        <p className="text-muted-foreground">Gestiona tus puntos de entrega para recibir tus pedidos</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-primary text-white btn-premium"
                    >
                        <Plus size={20} /> Agregar Nueva
                    </button>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-8 border-b border-border bg-muted/30">
                                <h2 className="text-2xl font-bold">Nueva Dirección</h2>
                                <p className="text-sm text-muted-foreground">Completa los datos para el delivery</p>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-muted-foreground uppercase mb-1">Nombre (Alias)</label>
                                        <input type="text" placeholder="Ej: Casa, Trabajo" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-muted-foreground uppercase mb-1">Zona</label>
                                        <select className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                                            {MOCK_ZONES.map(z => <option key={z}>{z}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1">Dirección Completa</label>
                                    <textarea rows={2} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Calle, edificio, apto..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase mb-1">Notas (Opcional)</label>
                                    <input type="text" placeholder="Cerca de..., Color de fachada..." className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>

                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center gap-4 cursor-pointer hover:bg-primary/10 transition-colors">
                                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center"><MapIcon size={20} /></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Ubicación en Google Maps</p>
                                        <p className="text-xs text-muted-foreground">Seleccionar del mapa para mayor precisión</p>
                                    </div>
                                    <ChevronRight size={16} className="text-primary" />
                                </div>
                            </div>

                            <div className="p-8 bg-muted/10 flex gap-4">
                                <button onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all">Cancelar</button>
                                <button className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all">Guardar Dirección</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {addresses.map(addr => (
                        <div key={addr.id} className="bg-card p-8 rounded-3xl border border-border shadow-sm flex items-start justify-between group hover:border-primary/50 transition-all">
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-secondary text-primary rounded-2xl flex items-center justify-center shrink-0">
                                    {addr.name === 'Casa' ? <Home size={28} /> : <Briefcase size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{addr.name}</h3>
                                    <p className="font-medium text-foreground/80 mb-1">{addr.address}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 rounded">Zona: {addr.zone}</span>
                                        <span className="text-xs text-muted-foreground italic">"{addr.notes}"</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border">
                            <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-muted-foreground">Aún no tienes direcciones</h3>
                            <p className="text-muted-foreground mb-6">Agrega una dirección para comenzar a pedir</p>
                            <button onClick={() => setShowForm(true)} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg">Agregar Mi Primera Dirección</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
