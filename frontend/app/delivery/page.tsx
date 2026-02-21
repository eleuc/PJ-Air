'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Truck, MapPin, Camera, CheckCircle2, Navigation, Clock, Phone, ChevronRight, Map as MapIcon, Loader2 } from 'lucide-react';

export default function DeliveryPanel() {
    const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
    const [activeDelivery, setActiveDelivery] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [location, setLocation] = useState<{ lat: string, lng: string } | null>(null);

    const mockAssigned = [
        { id: '1001', client: 'Juan Pérez', address: 'Calle Los Jabillos, Qta. La Milagrosa', zone: 'Norte', items: 3, status: 'Finalizado' },
        { id: '0995', client: 'Carlos Ruiz', address: 'Av. Principal, Edif Aurora, Apto 4B', zone: 'Centro', items: 1, status: 'Finalizado' },
    ];

    const startDelivery = (id: string) => {
        setActiveDelivery(id);
        // In real app, update DB status to "En Entrega"
    };

    const captureReception = () => {
        setIsCapturing(true);
        // Simulate GPS & Photo capture
        setTimeout(() => {
            setLocation({ lat: '10.4806', lng: '-66.9036' });
            setIsCapturing(false);
            alert('Foto y GPS capturados con éxito. Registrando hora: ' + new Date().toLocaleTimeString());
            setActiveDelivery(null);
            // Update DB to "Entregado"
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-10 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Truck className="text-primary" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-primary mb-2">Panel de Entregas</h1>
                    <p className="text-muted-foreground font-medium">Gestiona tu ruta y confirma entregas en tiempo real</p>
                </header>

                {!activeDelivery ? (
                    <div className="space-y-6">
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-border w-fit mx-auto mb-8">
                            <button onClick={() => setActiveTab('assigned')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'assigned' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}>Asignados</button>
                            <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}>Historial</button>
                        </div>

                        {mockAssigned.map(order => (
                            <div key={order.id} className="bg-card rounded-[32px] border border-border p-8 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-primary bg-primary/5 px-3 py-1 rounded-xl">#{order.id}</span>
                                        <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded tracking-widest">{order.status}</span>
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">{order.items} items</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="text-primary shrink-0" size={20} />
                                        <div>
                                            <p className="font-bold text-foreground leadig-tight">{order.address}</p>
                                            <p className="text-xs text-muted-foreground font-black uppercase tracking-wider mt-1">{order.zone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 py-4 border-t border-border">
                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-primary font-bold">J</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{order.client}</p>
                                            <p className="text-xs text-muted-foreground">Cliente Verificado</p>
                                        </div>
                                        <button className="p-3 bg-secondary text-primary rounded-xl hover:bg-primary hover:text-white transition-all"><Phone size={20} /></button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startDelivery(order.id)}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Navigation size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Iniciar Entrega
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-white rounded-[40px] border border-border shadow-2xl overflow-hidden mb-8">
                            <div className="bg-primary p-10 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold font-serif mb-1">Entrega en Progreso</h2>
                                    <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Orden #1001</p>
                                </div>
                                <Navigation size={40} className="animate-pulse" />
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="bg-muted/50 p-8 rounded-[32px] border border-border/50">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-muted-foreground uppercase mb-1 tracking-widest">Punto de Entrega</p>
                                            <p className="text-xl font-bold font-serif leading-tight text-foreground">Calle Los Jabillos, Qta. La Milagrosa. Zona Norte.</p>
                                        </div>
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-border rounded-2xl font-bold text-sm text-primary hover:bg-muted transition-all">
                                        <MapIcon size={18} /> Ver en el Mapa
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-muted-foreground uppercase text-center tracking-widest">Confirmación de entrega</h3>
                                    <button
                                        onClick={captureReception}
                                        disabled={isCapturing}
                                        className="w-full h-40 border-4 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary transition-all group overflow-hidden relative"
                                    >
                                        {isCapturing ? (
                                            <Loader2 size={48} className="animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <Camera size={48} className="group-hover:scale-110 transition-transform" />
                                                <span className="font-black uppercase text-xs tracking-widest">Tomar Foto de Entrega</span>
                                            </>
                                        )}
                                        {location && <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center"><CheckCircle2 size={60} className="text-green-500" /></div>}
                                    </button>
                                    <div className="flex justify-center gap-8 py-4 border-y border-border">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Clock size={14} /> GPS Registrado
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Clock size={14} /> Hora Automática
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveDelivery(null)}
                                    className="w-full py-5 border-2 border-border rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all"
                                >
                                    Cancelar Entrega
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
