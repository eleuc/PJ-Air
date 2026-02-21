'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Truck, Calendar, Clock, Plus, Edit2, Trash2, MapPin, Search, ChevronRight } from 'lucide-react';

const MOCK_TRANSPORTS = [
    { id: 1, name: 'Camión N-1', plates: 'ABC-123', type: 'Furgón' },
    { id: 2, name: 'Motorizado 05', plates: 'XYZ-987', type: 'Moto' },
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHIFTS = ['Mañana', 'Tarde', 'Noche', 'Madrugada', 'Todo el día'];

const MOCK_ROUTES = [
    { id: 1, transport: 'Camión N-1', zone: 'Norte', day: 'Lunes', shift: 'Todo el día' },
    { id: 2, transport: 'Motorizado 05', zone: 'Este', day: 'Miércoles', shift: 'Tarde' },
];

export default function AdminRoutesPage() {
    const [activeTab, setActiveTab] = useState<'routes' | 'transports'>('routes');
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="max-w-6xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-2">Logística y Rutas</h1>
                            <p className="text-muted-foreground">Gestiona la flota de transporte y la programación de entregas</p>
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border">
                            <button
                                onClick={() => setActiveTab('routes')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'routes' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                Programación de Rutas
                            </button>
                            <button
                                onClick={() => setActiveTab('transports')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'transports' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                Flota de Transporte
                            </button>
                        </div>
                    </header>

                    <div className="mb-6 flex justify-between items-center">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input type="text" placeholder={`Buscar ${activeTab === 'routes' ? 'rutas' : 'vehículos'}...`} className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-black transition-all">
                            <Plus size={20} /> Añadir {activeTab === 'routes' ? 'Ruta' : 'Transporte'}
                        </button>
                    </div>

                    {activeTab === 'routes' ? (
                        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <tr>
                                        <th className="px-8 py-4">Transporte</th>
                                        <th className="px-8 py-4">Zona de Trabajo</th>
                                        <th className="px-8 py-4">Día</th>
                                        <th className="px-8 py-4">Turno</th>
                                        <th className="px-8 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {MOCK_ROUTES.map(route => (
                                        <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-8 py-4 font-bold flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Truck size={16} /></div>
                                                {route.transport}
                                            </td>
                                            <td className="px-8 py-4"><span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold">{route.zone}</span></td>
                                            <td className="px-8 py-4 font-medium">{route.day}</td>
                                            <td className="px-8 py-4 text-sm font-medium text-muted-foreground">{route.shift}</td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 text-muted-foreground hover:text-primary"><Edit2 size={18} /></button>
                                                    <button className="p-2 text-muted-foreground hover:text-red-500"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_TRANSPORTS.map(item => (
                                <div key={item.id} className="bg-card p-8 rounded-3xl border border-border shadow-sm group hover:border-primary/50 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 bg-secondary text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Truck size={28} /></div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-1 rounded">{item.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                    <p className="text-sm text-primary font-bold mb-4 tracking-widest uppercase">PLACA: {item.plates}</p>
                                    <div className="flex gap-2 pt-4 border-t border-border">
                                        <button className="flex-1 py-3 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">Editar</button>
                                        <button className="flex-1 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal simplified */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h2 className="text-2xl font-bold">Añadir {activeTab === 'routes' ? 'Programación de Ruta' : 'Nuevo Transporte'}</h2>
                            </div>

                            <div className="p-8 space-y-6">
                                {activeTab === 'routes' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest font-serif">Transporte</label>
                                            <select className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20">
                                                {MOCK_TRANSPORTS.map(t => <option key={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Día de la Semana</label>
                                            <select className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20">
                                                {DAYS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Turno</label>
                                            <select className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20">
                                                {SHIFTS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Nombre del Transporte</label>
                                            <input type="text" placeholder="Ej: Unidad 01" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Placa</label>
                                            <input type="text" placeholder="XXX-000" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex gap-4 bg-muted/10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-muted-foreground">Cancelar</button>
                                <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
