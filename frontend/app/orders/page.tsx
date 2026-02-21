'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Package, Truck, CheckCircle2, AlertCircle, Clock, Eye, MessageSquareQuote } from 'lucide-react';

const MOCK_CLIENT_ORDERS = [
    { id: '1001', date: '2026-02-19', status: 'En Entrega', total: 12.00, delivery_date: '2026-02-22' },
    { id: '1000', date: '2026-02-15', status: 'Entregado', total: 25.50, delivery_date: '2026-02-18', payment_date: '2026-02-24' },
];

export default function ClientOrdersPage() {
    const [orders, setOrders] = useState(MOCK_CLIENT_ORDERS);
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
    const [note, setNote] = useState('');

    const confirmReception = (id: string) => {
        // In real app, call API
        setOrders(orders.map(o => {
            if (o.id === id) {
                const payDate = new Date();
                payDate.setDate(payDate.getDate() + 6);
                return {
                    ...o,
                    status: 'Entregado',
                    payment_date: payDate.toISOString().split('T')[0]
                };
            }
            return o;
        }));
        setShowConfirmModal(null);
        setNote('');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pedido': return <Clock className="text-blue-500" />;
            case 'En Producción': return <Package className="text-orange-500" />;
            case 'Finalizado': return <CheckCircle2 className="text-green-500" />;
            case 'En Entrega': return <Truck className="text-purple-500" />;
            case 'Entregado': return <CheckCircle2 className="text-primary" />;
            default: return <AlertCircle />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold font-serif text-primary mb-2">Mis Pedidos</h1>
                <p className="text-muted-foreground mb-10">Sigue el estado de tus delicias en tiempo real</p>

                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shrink-0">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold">Orden #{order.id}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.status === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">Realizado el {order.date}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total</p>
                                        <p className="text-lg font-black">${order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Entrega</p>
                                        <p className="text-sm font-bold text-foreground">{order.delivery_date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none p-3 bg-muted text-foreground rounded-xl hover:bg-border transition-colors flex items-center justify-center gap-2">
                                        <Eye size={18} /> <span className="md:hidden">Ver Detalle</span>
                                    </button>
                                    {order.status === 'En Entrega' && (
                                        <button
                                            onClick={() => setShowConfirmModal(order.id)}
                                            className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all"
                                        >
                                            Confirmar Recepción
                                        </button>
                                    )}
                                </div>
                            </div>

                            {order.status === 'Entregado' && order.payment_date && (
                                <div className="bg-primary/5 px-8 py-4 border-t border-primary/10 flex justify-between items-center">
                                    <p className="text-xs font-bold text-primary flex items-center gap-2">
                                        <Clock size={14} /> Este pedido deberá ser pagado el: <span className="underline uppercase">{order.payment_date}</span>
                                    </p>
                                    <button className="text-[10px] font-black text-primary border border-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-all uppercase">Ver Factura</button>
                                </div>
                            )}
                        </div>
                    ))}
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
