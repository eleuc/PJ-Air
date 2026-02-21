'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { CheckCircle2, Package, Calendar, Clock, MapPin, ChevronRight, ShoppingBag, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
    const [status, setStatus] = useState('Pedido');

    const mockOrder = {
        id: params.id || 'JHO-9021',
        date: '19 de Febrero, 2026',
        deliveryDate: '22 de Febrero, 2026',
        total: 35.50,
        items: [
            { name: 'Croissant de Chocolate Belga', qty: 2, price: 7.00 },
            { name: 'Tarta de Almendras (Grande)', qty: 1, price: 28.50 },
        ],
        address: 'Calle Los Jabillos, Qta. La Milagrosa, Zona Norte'
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center mb-16">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100/50">
                        <CheckCircle2 size={56} />
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-foreground mb-4">¡Pedido Confirmado!</h1>
                    <p className="text-lg text-muted-foreground font-medium">Gracias por confiar en Pedidos Jhoanes para tus momentos especiales.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Tracking & Info */}
                    <div className="lg:col-span-7 space-y-6">
                        <section className="bg-card rounded-[32px] border border-border p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 font-serif"><Clock className="text-primary" /> Estado del Pedido</h2>

                            <div className="relative space-y-12 pl-8 border-l-2 border-border ml-2">
                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 w-5 h-5 bg-primary rounded-full ring-4 ring-primary/20"></div>
                                    <div>
                                        <p className="font-black text-sm text-primary uppercase tracking-widest">Pedido Recibido</p>
                                        <p className="text-xs text-muted-foreground mt-1">Hemos recibido tu orden y ya estamos preparando los ingredientes.</p>
                                    </div>
                                </div>
                                <div className="relative opacity-30 grayscale">
                                    <div className="absolute -left-[41px] top-1 w-5 h-5 bg-muted-foreground rounded-full"></div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">En Producción</p>
                                        <p className="text-xs text-muted-foreground mt-1">Nuestros maestros pasteleros están trabajando en tus productos.</p>
                                    </div>
                                </div>
                                <div className="relative opacity-30 grayscale">
                                    <div className="absolute -left-[41px] top-1 w-5 h-5 bg-muted-foreground rounded-full"></div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">En Delivery</p>
                                        <p className="text-xs text-muted-foreground mt-1">Tu pedido va en camino a tu dirección.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-primary/5 rounded-[32px] border border-primary/10 p-8 flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-1">Fecha de Entrega</h3>
                                <p className="text-2xl font-bold text-foreground font-serif">{mockOrder.deliveryDate}</p>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-card rounded-[32px] border border-border p-8 shadow-xl sticky top-28">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-2 font-serif"><ShoppingBag size={20} className="text-primary" /> Tu compra</h3>
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-widest">#{mockOrder.id}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {mockOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start py-2">
                                        <div>
                                            <p className="font-bold text-sm">{item.qty}x {item.name}</p>
                                            <p className="text-xs text-muted-foreground">Especialidad Artesanal</p>
                                        </div>
                                        <p className="font-black text-sm">${item.price.toFixed(2)}</p>
                                    </div>
                                ))}

                                <div className="pt-6 border-t border-border space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${(mockOrder.total - 5).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                                        <span>Delivery</span>
                                        <span>$5.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-bold font-serif">Total Pagado</span>
                                        <span className="text-2xl font-black text-primary">${mockOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-2xl p-4 flex items-start gap-3 mb-8">
                                <MapPin className="text-primary shrink-0" size={18} />
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">{mockOrder.address}</p>
                            </div>

                            <div className="space-y-4">
                                <Link href="/orders" className="w-full flex items-center justify-center gap-2 py-4 bg-muted hover:bg-border transition-all rounded-2xl font-bold text-sm">
                                    <Receipt size={18} /> Ver Mis Pedidos
                                </Link>
                                <Link href="/catalog" className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all group">
                                    Seguir Comprando <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
