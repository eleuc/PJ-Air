'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, CreditCard, ChevronRight, ShoppingBag, Info } from 'lucide-react';

export default function CheckoutPage() {
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>('');
    const [selectedAddress, setSelectedAddress] = useState<number>(1);

    useEffect(() => {
        const calculateDates = () => {
            const now = new Date();
            const hour = now.getHours();
            let daysToAdd = hour < 13 ? 3 : 4; // 3 days if before 1pm, else 4 (assuming next day + 3)

            const delDate = new Date();
            delDate.setDate(now.getDate() + daysToAdd);

            const payDate = new Date(delDate);
            payDate.setDate(delDate.getDate() + 6);

            setDeliveryDate(delDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
            setPaymentDate(payDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
        };

        calculateDates();
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Form */}
                    <div className="flex-1 space-y-8">
                        <h1 className="text-4xl font-bold font-serif text-foreground">Confirmar Pedido</h1>

                        {/* Delivery Address Section */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-primary" /> Dirección de Entrega</h2>
                                <button className="text-sm font-bold text-primary hover:underline">Agregar Nueva</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setSelectedAddress(1)}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === 1 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                                >
                                    <p className="font-bold mb-1 underline">Casa</p>
                                    <p className="text-sm text-muted-foreground">Calle Los Jabillos, Qta. La Milagrosa. Zona Norte.</p>
                                </div>
                                <div
                                    onClick={() => setSelectedAddress(2)}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === 2 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                                >
                                    <p className="font-bold mb-1 underline">Oficina</p>
                                    <p className="text-sm text-muted-foreground">Av. Francisco de Miranda, Torre Diamante, Piso 8. Zona Centro.</p>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Time Info */}
                        <section className="bg-primary/5 rounded-3xl border border-primary/20 p-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-primary mb-1">Fecha de Entrega Estimada</h3>
                                    <p className="text-2xl font-black text-foreground capitalize mb-2">{deliveryDate}</p>
                                    <div className="flex items-center gap-2 text-xs py-1 px-3 bg-secondary text-primary rounded-full font-bold w-fit">
                                        <Info size={14} /> Pedido recibido antes de la 1:00 PM
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Note */}
                        <section className="bg-accent/5 rounded-3xl border border-accent/20 p-8 text-accent-foreground">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><CreditCard size={20} /> Política de Pago</h3>
                            <p className="text-sm">El producto será cobrado <strong>6 días después</strong> de haber sido recibido. </p>
                            <p className="text-sm mt-2">Tu fecha límite de pago para este pedido será: <strong className="text-foreground capitalize underline">{paymentDate}</strong></p>
                        </section>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl sticky top-28">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShoppingBag size={20} /> Resumen</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">2x Croissant de Chocolate</span>
                                    <span className="font-medium">$7.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">1x Cheesecake Slice</span>
                                    <span className="font-medium">$5.00</span>
                                </div>
                                <div className="border-t border-border pt-4 flex justify-between">
                                    <span className="font-bold">Total a Pagar</span>
                                    <span className="text-2xl font-black text-primary">$12.00</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group">
                                Confirmar Pedido <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors">
                                Seguir Comprando
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
