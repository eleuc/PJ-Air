'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Calendar, MapPin, CreditCard, ChevronRight, ShoppingBag, Info, Loader2, Plus, Clock, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>('');
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            setIsFetchingAddresses(true);
            try {
                const data = await api.get(`/addresses/user/${user.id}`);
                setAddresses(data);
                if (data && data.length > 0) setSelectedAddressId(data[0].id);
            } catch (err) {
                console.error('Error fetching addresses:', err);
            } finally {
                setIsFetchingAddresses(false);
            }
        };

        fetchAddresses();

        const calculateDates = () => {
            const now = new Date();
            const hour = now.getHours();
            let daysToAdd = hour < 13 ? 3 : 4;

            const delDate = new Date();
            delDate.setDate(now.getDate() + daysToAdd);

            const payDate = new Date(delDate);
            payDate.setDate(delDate.getDate() + 6);

            setDeliveryDate(delDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
            setPaymentDate(payDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
        };

        calculateDates();
    }, [user]);

    const handleSubmit = async () => {
        if (!selectedAddressId) {
            setShowAddressModal(true);
            return;
        }
        if (!user || cart.length === 0) return;
        
        setIsLoading(true);
        try {
            const order = await api.post('/orders', {
                userId: user.id,
                addressId: selectedAddressId,
                total: getCartTotal(),
                status: 'pending',
                deliveryDate: deliveryDate,
                paymentDueDate: paymentDate,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            clearCart();
            window.location.href = `/orders/${order.id}`;
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

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
                                <button 
                                    onClick={() => router.push('/profile/addresses/new?redirect=/checkout')}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Agregar Nueva
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isFetchingAddresses ? (
                                    <div className="col-span-full py-8 flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 size={18} className="animate-spin" /> Cargando tus direcciones...
                                    </div>
                                ) : addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                                        >
                                            <p className="font-bold mb-1 underline">{addr.alias}</p>
                                            <p className="text-sm text-muted-foreground">{addr.address}. Zona {addr.zone}.</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/60">
                                        <p className="text-sm text-muted-foreground mb-4">No tienes direcciones guardadas.</p>
                                        <button 
                                            onClick={() => window.location.href = '/profile/addresses/new?redirect=/checkout'}
                                            className="premium-button text-[10px] py-2 px-6"
                                        >
                                            Agregar mi primera dirección
                                        </button>
                                    </div>
                                )}
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
                        <section className="bg-accent/5 rounded-3xl border border-accent/20 p-8 text-black">
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
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/40 gap-4">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">${item.price} c/u</span>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="flex items-center gap-2 bg-white rounded-xl border border-border/60 p-1 shadow-sm">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-black min-w-[1rem] text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <span className="text-xs font-black text-primary min-w-[50px] text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                {cart.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4 italic">Tu carrito está vacío</p>
                                )}

                                <div className="border-t border-border pt-4 flex justify-between">
                                    <span className="font-bold">Total a Pagar</span>
                                    <span className="text-2xl font-black text-primary">${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={isLoading || cart.length === 0}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>Confirmar Pedido <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>

                            <button 
                                onClick={() => router.push('/')}
                                className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors"
                            >
                                Seguir Comprando
                            </button>

                            <div className="mt-8 pt-8 border-t border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2 text-center tracking-widest">¿Necesitas ayuda con tu pedido?</p>
                                <button 
                                    onClick={() => window.open('https://wa.me/yournumber?text=Hola, tengo una duda sobre mi pedido antes de confirmarlo.', '_blank')}
                                    className="w-full py-3 text-primary font-bold text-xs hover:underline transition-all flex items-center justify-center gap-2"
                                >
                                    Contactar Soporte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Validación de Dirección */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-10 text-center border-b border-border">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MapPin size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4 font-serif italic text-primary">¡Falta tu dirección!</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Para llevarte estas delicias, necesitamos saber a dónde enviarlas. Por favor, agrega o selecciona una dirección de entrega.
                                </p>
                            </div>

                            <div className="p-10 bg-muted/5 space-y-4">
                                <button 
                                    onClick={() => router.push('/profile/addresses/new?redirect=/checkout')}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Agregar Dirección
                                </button>
                                <button 
                                    onClick={() => setShowAddressModal(false)} 
                                    className="w-full py-3 font-bold text-muted-foreground hover:text-foreground transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Entendido, volver
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
