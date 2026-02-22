'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Truck, Plus, Edit2, Trash2, MapPin, Search, X, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const LS_ROUTES = 'admin_routes_data';
const LS_TRANSPORTS = 'admin_transports_data';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHIFTS = ['Mañana', 'Tarde', 'Noche', 'Madrugada', 'Todo el día'];
const VEHICLE_TYPES = ['Furgón', 'Moto', 'Camioneta', 'Bicicleta'];

interface Transport { id: number; name: string; plates: string; type: string; }
interface Route { id: number; transportId: number; zone: string; day: string; shift: string; }

const DEFAULT_TRANSPORTS: Transport[] = [
    { id: 1, name: 'Camión N-1', plates: 'ABC-123', type: 'Furgón' },
    { id: 2, name: 'Motorizado 05', plates: 'XYZ-987', type: 'Moto' },
];
const DEFAULT_ROUTES: Route[] = [
    { id: 1, transportId: 1, zone: 'Norte', day: 'Lunes', shift: 'Todo el día' },
    { id: 2, transportId: 2, zone: 'Este', day: 'Miércoles', shift: 'Tarde' },
];

function load<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function save(key: string, data: any) { localStorage.setItem(key, JSON.stringify(data)); }

export default function AdminRoutesPage() {
    const [activeTab, setActiveTab] = useState<'routes' | 'transports'>('routes');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [transports, setTransports] = useState<Transport[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Route form
    const emptyRoute = { transportId: 0, zone: '', day: DAYS[0], shift: SHIFTS[0] };
    const emptyTransport = { name: '', plates: '', type: VEHICLE_TYPES[0] };
    const [form, setForm] = useState<any>(emptyRoute);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        setRoutes(load(LS_ROUTES, DEFAULT_ROUTES));
        setTransports(load(LS_TRANSPORTS, DEFAULT_TRANSPORTS));
    }, []);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(activeTab === 'routes' ? { ...emptyRoute, transportId: transports[0]?.id || 0 } : { ...emptyTransport });
        setFormError(null);
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setEditing(item);
        setForm(activeTab === 'routes'
            ? { transportId: item.transportId, zone: item.zone, day: item.day, shift: item.shift }
            : { name: item.name, plates: item.plates, type: item.type });
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = () => {
        setFormError(null);
        if (activeTab === 'routes') {
            if (!form.zone?.trim()) { setFormError('La zona es requerida.'); return; }
            if (!form.transportId) { setFormError('Selecciona un transporte.'); return; }
            if (editing) {
                const updated = routes.map(r => r.id === editing.id ? { ...r, ...form } : r);
                setRoutes(updated); save(LS_ROUTES, updated);
                showToast('✅ Ruta actualizada');
            } else {
                const newId = Math.max(0, ...routes.map(r => r.id)) + 1;
                const updated = [...routes, { id: newId, ...form }];
                setRoutes(updated); save(LS_ROUTES, updated);
                showToast('✅ Ruta creada');
            }
        } else {
            if (!form.name?.trim()) { setFormError('El nombre es requerido.'); return; }
            if (!form.plates?.trim()) { setFormError('La placa es requerida.'); return; }
            if (editing) {
                const updated = transports.map(t => t.id === editing.id ? { ...t, ...form } : t);
                setTransports(updated); save(LS_TRANSPORTS, updated);
                showToast('✅ Transporte actualizado');
            } else {
                const newId = Math.max(0, ...transports.map(t => t.id)) + 1;
                const updated = [...transports, { id: newId, ...form }];
                setTransports(updated); save(LS_TRANSPORTS, updated);
                showToast('✅ Transporte creado');
            }
        }
        setShowModal(false);
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;
        if (activeTab === 'routes') {
            const updated = routes.filter(r => r.id !== deleteConfirm.id);
            setRoutes(updated); save(LS_ROUTES, updated);
            showToast('🗑️ Ruta eliminada');
        } else {
            const updated = transports.filter(t => t.id !== deleteConfirm.id);
            setTransports(updated); save(LS_TRANSPORTS, updated);
            // Remove routes using this transport
            const updatedRoutes = routes.filter(r => r.transportId !== deleteConfirm.id);
            setRoutes(updatedRoutes); save(LS_ROUTES, updatedRoutes);
            showToast('🗑️ Transporte eliminado');
        }
        setDeleteConfirm(null);
    };

    const getTransportName = (tId: number) => transports.find(t => t.id === tId)?.name || '—';

    const filteredRoutes = routes.filter(r =>
        getTransportName(r.transportId).toLowerCase().includes(search.toLowerCase()) ||
        r.zone.toLowerCase().includes(search.toLowerCase())
    );
    const filteredTransports = transports.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.plates.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <div className="max-w-6xl">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Logística y Rutas</h1>
                            <p className="text-muted-foreground">Gestiona la flota de transporte y la programación de entregas</p>
                        </div>
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border">
                            <button onClick={() => { setActiveTab('routes'); setSearch(''); }} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'routes' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}>
                                Programación de Rutas
                            </button>
                            <button onClick={() => { setActiveTab('transports'); setSearch(''); }} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'transports' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted'}`}>
                                Flota de Transporte
                            </button>
                        </div>
                    </header>

                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Buscar ${activeTab === 'routes' ? 'rutas' : 'vehículos'}...`} className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-black transition-all shrink-0">
                            <Plus size={20} /> Añadir {activeTab === 'routes' ? 'Ruta' : 'Transporte'}
                        </button>
                    </div>

                    {activeTab === 'routes' ? (
                        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <tr>
                                        <th className="px-8 py-4">Transporte</th>
                                        <th className="px-8 py-4">Zona</th>
                                        <th className="px-8 py-4">Día</th>
                                        <th className="px-8 py-4">Turno</th>
                                        <th className="px-8 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredRoutes.map(route => (
                                        <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-8 py-4 font-bold">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Truck size={16} /></div>
                                                    {getTransportName(route.transportId)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4"><span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><MapPin size={11} />{route.zone}</span></td>
                                            <td className="px-8 py-4 font-medium">{route.day}</td>
                                            <td className="px-8 py-4 text-sm font-medium text-muted-foreground">{route.shift}</td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEdit(route)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 size={16} /></button>
                                                    <button onClick={() => setDeleteConfirm(route)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRoutes.length === 0 && (
                                        <tr><td colSpan={5} className="px-8 py-16 text-center text-muted-foreground">Sin rutas{search ? ` para "${search}"` : '. Crea la primera ruta.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTransports.map(item => (
                                <div key={item.id} className="bg-card p-8 rounded-3xl border border-border shadow-sm group hover:border-primary/50 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 bg-secondary text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Truck size={28} /></div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-1 rounded">{item.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                    <p className="text-sm text-primary font-bold mb-4 tracking-widest uppercase">PLACA: {item.plates}</p>
                                    <div className="flex gap-2 pt-4 border-t border-border">
                                        <button onClick={() => openEdit(item)} className="flex-1 py-3 text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all flex items-center justify-center gap-1.5"><Edit2 size={13} />Editar</button>
                                        <button onClick={() => setDeleteConfirm(item)} className="flex-1 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-1.5"><Trash2 size={13} />Eliminar</button>
                                    </div>
                                </div>
                            ))}
                            {filteredTransports.length === 0 && (
                                <div className="col-span-3 text-center py-16 bg-card rounded-3xl border border-border text-muted-foreground">
                                    Sin vehículos{search ? ` para "${search}"` : '. Añade el primero.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm animate-fade-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                    <CheckCircle2 size={20} />{toast.msg}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/20">
                            <h2 className="text-xl font-bold">{editing ? 'Editar' : 'Nuevo'} {activeTab === 'routes' ? 'Ruta' : 'Transporte'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            {formError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    <AlertCircle size={15} />{formError}
                                </div>
                            )}
                            {activeTab === 'routes' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Transporte *</label>
                                        <select value={form.transportId} onChange={e => setForm((f: any) => ({ ...f, transportId: Number(e.target.value) }))} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                            <option value={0}>— Seleccionar —</option>
                                            {transports.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Zona de Trabajo *</label>
                                        <input type="text" value={form.zone} onChange={e => setForm((f: any) => ({ ...f, zone: e.target.value }))} placeholder="Ej: Norte, Centro, Sur..." className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Día</label>
                                            <select value={form.day} onChange={e => setForm((f: any) => ({ ...f, day: e.target.value }))} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                                {DAYS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Turno</label>
                                            <select value={form.shift} onChange={e => setForm((f: any) => ({ ...f, shift: e.target.value }))} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                                {SHIFTS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Nombre del Transporte *</label>
                                        <input type="text" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Ej: Unidad 01, Motorizado 03..." className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Placa *</label>
                                        <input type="text" value={form.plates} onChange={e => setForm((f: any) => ({ ...f, plates: e.target.value }))} placeholder="Ej: XYZ-000" className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-muted-foreground mb-1.5">Tipo de Vehículo</label>
                                        <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                            {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="px-8 py-6 bg-muted/10 flex gap-4 border-t border-border">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl">Cancelar</button>
                            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl">
                                <Save size={18} />{editing ? 'Guardar cambios' : 'Crear'}
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
                            <h2 className="text-xl font-bold mb-2">¿Eliminar?</h2>
                            <p className="text-muted-foreground text-sm">
                                {activeTab === 'transports' && routes.some(r => r.transportId === deleteConfirm.id)
                                    ? `"${deleteConfirm.name}" tiene rutas asignadas. Se eliminarán también.`
                                    : `Esta acción no se puede deshacer.`}
                            </p>
                        </div>
                        <div className="p-6 flex gap-4">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 font-bold text-muted-foreground hover:bg-muted rounded-2xl">Cancelar</button>
                            <button onClick={handleDelete} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
