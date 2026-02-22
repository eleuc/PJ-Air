'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Package, Truck, CheckCircle2, AlertCircle, Clock, Eye, MessageSquareQuote, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ClientOrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const data = await api.get(`/orders/user/${user.id}`);
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const confirmReception = async (id: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: "Entregado" });
            setOrders(orders.map(o => (o.id === id ? { ...o, status: 'Entregado' } : o)));
            setShowConfirmModal(null);
            setNote('');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al confirmar');
        }
    };

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('pedido') || s.includes('pending')) return <Clock className="text-blue-500" />;
        if (s.includes('produ') || s.includes('processing')) return <Package className="text-orange-500" />;
        if (s.includes('finalizado') || s.includes('completed')) return <CheckCircle2 className="text-green-500" />;
        if (s.includes('entrega') || s.includes('delivery')) return <Truck className="text-purple-500" />;
        if (s.includes('entregado') || s.includes('delivered')) return <CheckCircle2 className="text-primary" />;
        return <AlertCircle />;
    };

    const getStatusLabel = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending' || s === 'pedido') return 'Pedido Recibido';
        if (s === 'processing' || s === 'en producción') return 'En Producción';
        if (s === 'completed' || s === 'finalizado') return 'Finalizado';
        if (s === 'delivery' || s === 'en entrega') return 'En Entrega';
        if (s === 'delivered' || s === 'entregado') return 'Entregado';
        return status;
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold font-serif text-primary mb-2">Mis Pedidos</h1>
                <p className="text-muted-foreground mb-10">Sigue el estado de tus delicias en tiempo real</p>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                            <Loader2 size={40} className="animate-spin text-primary/20 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando tus pedidos...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shrink-0">
                                            {getStatusIcon(order.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold">Orden #{order.id.slice(0, 8)}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.status.toLowerCase().includes('entregado') ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">Realizado el {new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total</p>
                                            <p className="text-lg font-black">${(Number(order.total) || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Entrega</p>
                                            <p className="text-sm font-bold text-foreground">{order.delivery_date || 'Pendiente'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button 
                                            onClick={() => router.push(`/orders/${order.id}`)}
                                            className="flex-1 md:flex-none p-3 bg-muted text-foreground rounded-xl hover:bg-border transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={18} /> <span className="md:hidden">Ver Detalle</span>
                                        </button>
                                        {(order.status === 'delivery' || order.status === 'En Entrega') && (
                                            <button
                                                onClick={() => setShowConfirmModal(order.id)}
                                                className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all"
                                            >
                                                Confirmar Recepción
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {(order.status.toLowerCase().includes('entregado')) && order.payment_due_date && (
                                    <div className="bg-primary/5 px-8 py-4 border-t border-primary/10 flex justify-between items-center">
                                        <p className="text-xs font-bold text-primary flex items-center gap-2">
                                            <Clock size={14} /> Este pedido deberá ser pagado antes del: <span className="underline uppercase">{order.payment_due_date}</span>
                                        </p>
                                        <button className="text-[10px] font-black text-primary border border-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-all uppercase">Ver Factura</button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border flex flex-col items-center">
                            <ShoppingBag className="text-muted-foreground/30 mb-4" size={48} />
                            <p className="text-muted-foreground font-medium mb-6">Aún no has realizado ningún pedido.</p>
                            <button 
                                onClick={() => router.push('/')}
                                className="premium-button py-3 px-8"
                            >
                                Empezar a comprar
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Confirmación */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-8 text-center border-b border-border">
                                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">¿Recibiste tu pedido?</h2>
                                <p className="text-sm text-muted-foreground">Confirma que el pedido ha llegado a tus manos en perfectas condiciones.</p>
                            </div>

                            <div className="p-8 space-y-4">
                                <label className="block text-xs font-black text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                    <MessageSquareQuote size={14} /> ¿Alguna nota sobre el pedido?
                                </label>
                                <textarea
                                    className="w-full p-4 bg-muted rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm h-24"
                                    placeholder="Excelente calidad, gracias..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="p-8 bg-muted/10 flex gap-4">
                                <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-muted transition-all">Cancelar</button>
                                <button
                                    onClick={() => confirmReception(showConfirmModal)}
                                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all"
                                >
                                    Sí, Recibido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
