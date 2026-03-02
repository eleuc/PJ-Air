'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
    Calendar, MapPin, CreditCard, ChevronRight, ShoppingBag,
    Loader2, Plus, Clock, Minus, Store, Truck, Home,
    ChevronDown, Check, AlertCircle, BookmarkPlus, Bookmark,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Delivery type
// ─────────────────────────────────────────────────────────────────────────────
type DeliveryType = 'pickup' | 'saved' | 'other';

// ─────────────────────────────────────────────────────────────────────────────
// Inline address form (for "Other address" option)
// ─────────────────────────────────────────────────────────────────────────────
function InlineAddressForm({
    onReady,
    locale,
}: {
    onReady: (data: { alias: string; address: string; notes: string; saveMode: 'save' | 'temporary' }) => void;
    locale: string;
}) {
    const [alias, setAlias] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [saveMode, setSaveMode] = useState<'save' | 'temporary'>('save');

    useEffect(() => {
        onReady({ alias, address, notes, saveMode });
    }, [alias, address, notes, saveMode]);

    const lbl = (es: string, en: string) => locale === 'en' ? en : es;

    return (
        <div className="mt-6 bg-muted/30 rounded-2xl border border-border/60 p-6 space-y-5 animate-fade-in">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60">
                {lbl('Nueva dirección de entrega', 'New delivery address')}
            </h4>

            {/* Alias */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('Nombre / Alias', 'Name / Alias')}
                </label>
                <input
                    type="text"
                    required
                    placeholder={lbl('Ej: Oficina, Casa de Ana', 'e.g. Office, Ana's house')}
                    value={alias}
                    onChange={e => setAlias(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('Dirección completa', 'Full address')}
                </label>
                <textarea
                    required
                    rows={2}
                    placeholder={lbl('Calle, número, ciudad...', 'Street, number, city...')}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('Notas adicionales (opcional)', 'Additional notes (optional)')}
                </label>
                <input
                    type="text"
                    placeholder={lbl('Ej: Portón azul, piso 3...', 'e.g. Blue gate, floor 3...')}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
            </div>

            {/* Save mode */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('¿Deseas guardar esta dirección?', 'Would you like to save this address?')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setSaveMode('save')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                            saveMode === 'save'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border/50 text-muted-foreground hover:border-primary/30'
                        }`}
                    >
                        <BookmarkPlus size={15} />
                        {lbl('Guardar dirección', 'Save address')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSaveMode('temporary')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                            saveMode === 'temporary'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-border/50 text-muted-foreground hover:border-amber-300'
                        }`}
                    >
                        <Bookmark size={15} />
                        {lbl('Solo para este pedido', 'One-time only')}
                    </button>
                </div>
                {saveMode === 'temporary' && (
                    <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle size={11} />
                        {lbl(
                            'Esta dirección no aparecerá en tu perfil pero quedará registrada en el pedido.',
                            'This address won\'t appear in your profile but will be stored with the order.'
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main checkout page
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const { locale } = useLanguage();
    const router = useRouter();

    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [isBeforeCutoff, setIsBeforeCutoff] = useState(true);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

    // Delivery type
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('saved');
    const [otherAddrData, setOtherAddrData] = useState<{
        alias: string; address: string; notes: string; saveMode: 'save' | 'temporary';
    }>({ alias: '', address: '', notes: '', saveMode: 'save' });

    const lbl = (es: string, en: string) => locale === 'en' ? en : es;

    // ── Fetch addresses ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        setIsFetchingAddresses(true);
        api.get(`/addresses/user/${user.id}`)
            .then(data => {
                setAddresses(Array.isArray(data) ? data : []);
                if (data?.length > 0) setSelectedAddressId(data[0].id);
            })
            .catch(console.error)
            .finally(() => setIsFetchingAddresses(false));
    }, [user]);

    // ── Delivery date (NY timezone) ───────────────────────────────────────────
    useEffect(() => {
        const nowNY = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const before = nowNY.getHours() < 13;
        const daysToAdd = before ? 2 : 3;
        const delDate = new Date(nowNY);
        delDate.setDate(nowNY.getDate() + daysToAdd);
        const payDate = new Date(delDate);
        payDate.setDate(delDate.getDate() + 6);
        setIsBeforeCutoff(before);
        setDeliveryDate(delDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
        setPaymentDate(payDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, []);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!user || cart.length === 0) return;

        let finalAddressId: string | null = null;
        let deliveryAddressText: string | null = null;

        if (deliveryType === 'saved') {
            if (!selectedAddressId) {
                alert(lbl('Por favor selecciona una dirección guardada.', 'Please select a saved address.'));
                return;
            }
            finalAddressId = selectedAddressId;
        } else if (deliveryType === 'other') {
            if (!otherAddrData.alias.trim() || !otherAddrData.address.trim()) {
                alert(lbl('Por favor completa el nombre y la dirección.', 'Please fill in name and address.'));
                return;
            }
            // Create address record (temporary or permanent)
            try {
                const newAddr = await api.post('/addresses', {
                    userId: user.id,
                    alias: otherAddrData.alias,
                    address: otherAddrData.address,
                    notes: otherAddrData.notes,
                    is_temporary: otherAddrData.saveMode === 'temporary',
                });
                finalAddressId = newAddr.id;
                deliveryAddressText = otherAddrData.address;
            } catch (e) {
                alert(lbl('Error guardando la dirección. Intenta de nuevo.', 'Error saving address. Please try again.'));
                return;
            }
        }
        // pickup → no address needed

        setIsLoading(true);
        try {
            const order = await api.post('/orders', {
                userId: user.id,
                addressId: finalAddressId,
                deliveryType,
                deliveryAddressText,
                total: getCartTotal(),
                status: 'Pedido Enviado',
                deliveryDate,
                paymentDueDate: paymentDate,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
            clearCart();
            window.location.href = `/orders/${order.id}`;
        } catch (error) {
            console.error('Error placing order:', error);
            alert(lbl(
                'Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.',
                'There was an error processing your order. Please try again.'
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Delivery type options ─────────────────────────────────────────────────
    const typeOptions: { value: DeliveryType; icon: React.ReactNode; label: string; desc: string }[] = [
        {
            value: 'pickup',
            icon: <Store size={20} />,
            label: lbl('Pick Up', 'Pick Up'),
            desc: lbl('Retiro en nuestra tienda (Jhoanes)', 'Pick up at our store (Jhoanes)'),
        },
        {
            value: 'saved',
            icon: <Home size={20} />,
            label: lbl('Dirección Guardada', 'Saved Address'),
            desc: lbl('Usar una de mis direcciones registradas', 'Use one of my saved addresses'),
        },
        {
            value: 'other',
            icon: <Truck size={20} />,
            label: lbl('Otra Dirección', 'Other Address'),
            desc: lbl('Entregar en una dirección diferente', 'Deliver to a different address'),
        },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* ── Left column ───────────────────────────────────────── */}
                    <div className="flex-1 space-y-8">
                        <h1 className="text-4xl font-bold font-serif text-foreground">
                            {lbl('Confirmar Pedido', 'Confirm Order')}
                        </h1>

                        {/* ── Delivery type selector ───────────────────────── */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <Truck className="text-primary" size={20} />
                                {lbl('Tipo de Entrega', 'Delivery Type')}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {typeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setDeliveryType(opt.value)}
                                        className={`flex flex-col items-start gap-2 p-5 rounded-2xl border-2 text-left transition-all ${
                                            deliveryType === opt.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            deliveryType === opt.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {deliveryType === opt.value ? <Check size={18} /> : opt.icon}
                                        </div>
                                        <p className="font-black text-sm">{opt.label}</p>
                                        <p className="text-[11px] text-muted-foreground leading-snug">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>

                            {/* ── Pick Up info ────────────────────────────── */}
                            {deliveryType === 'pickup' && (
                                <div className="mt-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-5 animate-fade-in">
                                    <Store size={20} className="text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-green-800 text-sm">
                                            {lbl('Recoger en tienda', 'Store Pickup')}
                                        </p>
                                        <p className="text-xs text-green-600 mt-0.5">
                                            {lbl(
                                                'Te avisaremos cuando tu pedido esté listo para recoger en Jhoanes.',
                                                'We\'ll notify you when your order is ready for pickup at Jhoanes.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Saved addresses ───────────────────────── */}
                            {deliveryType === 'saved' && (
                                <div className="mt-6 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-muted-foreground">
                                            {lbl('Selecciona tu dirección de entrega:', 'Select your delivery address:')}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/profile/addresses/new?redirect=/checkout')}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={13} />
                                            {lbl('Agregar nueva', 'Add new')}
                                        </button>
                                    </div>

                                    {isFetchingAddresses ? (
                                        <div className="py-6 flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 size={18} className="animate-spin" />
                                            {lbl('Cargando tus direcciones...', 'Loading your addresses...')}
                                        </div>
                                    ) : addresses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {addresses.map(addr => (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                                                        selectedAddressId === addr.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-bold text-sm">{addr.alias}</p>
                                                        {selectedAddressId === addr.id && (
                                                            <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                                                                <Check size={11} strokeWidth={3} className="text-white" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{addr.address}</p>
                                                    {addr.notes && (
                                                        <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{addr.notes}</p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/60">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {lbl('No tienes direcciones guardadas.', 'You have no saved addresses.')}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/profile/addresses/new?redirect=/checkout')}
                                                className="px-5 py-2.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all"
                                            >
                                                {lbl('Agregar mi primera dirección', 'Add my first address')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Other address (inline form) ──────────── */}
                            {deliveryType === 'other' && (
                                <InlineAddressForm
                                    locale={locale}
                                    onReady={data => setOtherAddrData(data)}
                                />
                            )}
                        </section>

                        {/* ── Delivery date ────────────────────────────────── */}
                        {deliveryType !== 'pickup' && (
                            <section className="bg-[#0f0f0f] rounded-3xl border border-[#222] p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 text-white rounded-2xl shadow-md shrink-0">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {lbl('Fecha de Entrega Estimada', 'Estimated Delivery Date')}
                                        </h3>
                                        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 ${
                                            isBeforeCutoff
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            <Clock size={12} />
                                            {isBeforeCutoff
                                                ? lbl('Pedido antes de la 1:00 PM hora NY → entrega en 2 días', 'Order before 1:00 PM NY → delivery in 2 days')
                                                : lbl('Pedido después de la 1:00 PM hora NY → entrega en 3 días', 'Order after 1:00 PM NY → delivery in 3 days')}
                                        </div>
                                        <p className="text-3xl font-black text-white capitalize">{deliveryDate}</p>
                                        <p className="text-xs text-white/40 mt-3 leading-relaxed">
                                            {lbl(
                                                'Pedidos recibidos antes de la 1:00 PM (hora Nueva York) se entregan en 2 días. Pedidos recibidos a partir de la 1:00 PM se entregan en 3 días.',
                                                'Orders received before 1:00 PM (New York time) are delivered in 2 days. Orders received from 1:00 PM are delivered in 3 days.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Pickup date info */}
                        {deliveryType === 'pickup' && (
                            <section className="bg-[#0f0f0f] rounded-3xl border border-[#222] p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 text-white rounded-2xl shadow-md shrink-0">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {lbl('Fecha de Disponibilidad Estimada', 'Estimated Ready Date')}
                                        </h3>
                                        <p className="text-3xl font-black text-white capitalize">{deliveryDate}</p>
                                        <p className="text-xs text-white/40 mt-2">
                                            {lbl('Tu pedido estará listo para recoger en tienda.', 'Your order will be ready for pickup at our store.')}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── Payment note ─────────────────────────────────── */}
                        <section className="bg-accent/5 rounded-3xl border border-accent/20 p-8 text-black">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <CreditCard size={20} />
                                {lbl('Política de Pago', 'Payment Policy')}
                            </h3>
                            <p className="text-sm">
                                {lbl(
                                    'El producto será cobrado ',
                                    'The product will be charged '
                                )}
                                <strong>{lbl('6 días después', '6 days after')}</strong>
                                {lbl(' de haber sido recibido. ', ' of being received. ')}
                            </p>
                            <p className="text-sm mt-2">
                                {lbl('Tu fecha límite de pago para este pedido será: ', 'Your payment deadline for this order will be: ')}
                                <strong className="text-foreground capitalize underline">{paymentDate}</strong>
                            </p>
                        </section>
                    </div>

                    {/* ── Right sidebar ─────────────────────────────────────── */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl sticky top-28">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShoppingBag size={20} />
                                {lbl('Resumen', 'Order Summary')}
                            </h2>

                            <div className="space-y-4 mb-8">
                                {cart.map(item => (
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
                                            <span className="text-xs font-black text-primary min-w-[50px] text-right">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {cart.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4 italic">
                                        {lbl('Tu carrito está vacío', 'Your cart is empty')}
                                    </p>
                                )}

                                {/* Delivery type badge in summary */}
                                <div className="pt-2 flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                        deliveryType === 'pickup'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-primary/5 text-primary border-primary/20'
                                    }`}>
                                        {deliveryType === 'pickup'
                                            ? lbl('🏪 Pick Up en tienda', '🏪 Store Pickup')
                                            : lbl('🚛 Delivery', '🚛 Delivery')}
                                    </span>
                                </div>

                                <div className="border-t border-border pt-4 flex justify-between">
                                    <span className="font-bold">{lbl('Total a Pagar', 'Total')}</span>
                                    <span className="text-2xl font-black text-primary">${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || cart.length === 0}
                                className="w-full py-4 bg-[#111] hover:bg-[#222] text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {lbl('Confirmar Pedido', 'Place Order')}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors"
                            >
                                {lbl('Seguir Comprando', 'Continue Shopping')}
                            </button>

                            <div className="mt-8 pt-8 border-t border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2 text-center tracking-widest">
                                    {lbl('¿Necesitas ayuda con tu pedido?', 'Need help with your order?')}
                                </p>
                                <button
                                    onClick={() => window.open('https://wa.me/yournumber?text=Hola, tengo una duda sobre mi pedido antes de confirmarlo.', '_blank')}
                                    className="w-full py-3 text-primary font-bold text-xs hover:underline transition-all flex items-center justify-center gap-2"
                                >
                                    {lbl('Contactar Soporte', 'Contact Support')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
