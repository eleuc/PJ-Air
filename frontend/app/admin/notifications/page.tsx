'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Bell, Clock, Zap, Settings, Save, AlertTriangle } from 'lucide-react';

export default function AdminNotificationsPage() {
    const [isRealtime, setIsRealtime] = useState(true);
    const [scheduledTime, setScheduledTime] = useState('18:00');
    const [isSaving, setIsSaving] = useState(false);

    const saveSettings = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Configuración de notificaciones actualizada');
        }, 1000);
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="max-w-4xl">
                    <header className="mb-10">
                        <h1 className="text-3xl font-bold mb-2">Gestión de Notificaciones</h1>
                        <p className="text-muted-foreground">Configura cómo y cuándo deseas recibir las alertas del sistema</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Realtime Mode */}
                        <div
                            onClick={() => setIsRealtime(true)}
                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${isRealtime ? 'border-primary bg-card shadow-xl ring-4 ring-primary/5' : 'border-border grayscale hover:grayscale-0 opacity-60 hover:opacity-100 hover:bg-card'}`}
                        >
                            <div className={`p-4 rounded-2xl ${isRealtime ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Zap size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Tiempo Real</h3>
                                <p className="text-sm text-muted-foreground">Recibe alertas instantáneas en cuanto ocurra un pedido o cambio de estado.</p>
                            </div>
                            {isRealtime && <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">Activo</span>}
                        </div>

                        {/* Scheduled Mode */}
                        <div
                            onClick={() => setIsRealtime(false)}
                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${!isRealtime ? 'border-primary bg-card shadow-xl ring-4 ring-primary/5' : 'border-border grayscale hover:grayscale-0 opacity-60 hover:opacity-100 hover:bg-card'}`}
                        >
                            <div className={`p-4 rounded-2xl ${!isRealtime ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Clock size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Alarma Consolidada</h3>
                                <p className="text-sm text-muted-foreground">Recibe un resumen diario de todas las notificaciones a una hora específica.</p>
                            </div>
                            {!isRealtime && <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">Activo</span>}
                        </div>
                    </div>

                    <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-primary" /> Ajustes Detallados</h2>
                            <button
                                onClick={saveSettings}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all"
                            >
                                <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-border">
                                <div>
                                    <p className="font-bold">Notificar nuevos pedidos</p>
                                    <p className="text-xs text-muted-foreground">Alertar cuando un cliente realice una nueva compra</p>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b border-border">
                                <div>
                                    <p className="font-bold">Notificar cambios de ruta</p>
                                    <p className="text-xs text-muted-foreground">Alertar cuando el transporte inicie el delivery</p>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>

                            {!isRealtime && (
                                <div className="pt-4 animate-fade-in">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">Hora de Envío del Consolidado</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="px-6 py-4 bg-muted rounded-2xl font-black text-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                        <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl flex items-center gap-3 text-xs border border-orange-100 max-w-sm">
                                            <AlertTriangle size={24} className="shrink-0" />
                                            <p>Las notificaciones se acumularán y se enviarán en bloque a las <strong>{scheduledTime}</strong>.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
