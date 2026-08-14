'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
    Calendar, MapPin, CreditCard, ChevronRight, ShoppingBag,
    Loader2, Plus, Clock, Minus, Store, Truck, Home,
    ChevronDown, Check, AlertCircle, BookmarkPlus, Bookmark,
    Map as MapIcon, RotateCcw, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_KEY } from '@/lib/config';

// MIN_ORDER_AMOUNT was migrated to dynamic configuration loaded from the backend API

const mapContainerStyle = {
    width: '100%',
    height: '350px',
    borderRadius: '24px'
};

const centerNY = { lat: 40.7128, lng: -74.0060 };

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
};

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
    onReady: (data: { alias: string; address: string; notes: string; saveMode: 'save' | 'temporary'; lat: number; lng: number; refined_lat: number | null; refined_lng: number | null }) => void;
    locale: string;
}) {
    const [alias, setAlias] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [saveMode, setSaveMode] = useState<'save' | 'temporary'>('save');
    const [markerPos, setMarkerPos] = useState(centerNY);
    const [geocodedPos, setGeocodedPos] = useState<{lat: number, lng: number} | null>(null);
    const [refinedPos, setRefinedPos] = useState<{lat: number, lng: number} | null>(null);
    const [isManualAdjustment, setIsManualAdjustment] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        onReady({ 
            alias, 
            address, 
            notes, 
            saveMode,
            lat: geocodedPos?.lat || markerPos.lat,
            lng: geocodedPos?.lng || markerPos.lng,
            refined_lat: isManualAdjustment ? refinedPos?.lat || null : null,
            refined_lng: isManualAdjustment ? refinedPos?.lng || null : null
        });
    }, [alias, address, notes, saveMode, markerPos, geocodedPos, refinedPos, isManualAdjustment]);

    const lbl = (es: string, en: string) => locale === 'en' ? en : es;

    const reverseGeocode = (pos: { lat: number, lng: number }) => {
        if (typeof google === 'undefined') return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setAddress(results[0].formatted_address);
            }
        });
    };

    const forwardGeocode = () => {
        if (typeof google === 'undefined' || !address) return;
        setIsGeocoding(true);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
                const newPos = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                setMarkerPos(newPos);
                setGeocodedPos(newPos);
                setIsManualAdjustment(false);
                setRefinedPos(null);
                map?.panTo(newPos);
            }
        });
    };

    const handleMapClick = React.useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(newPos);
            setRefinedPos(newPos);
            setIsManualAdjustment(true);
            reverseGeocode(newPos);
        }
    }, []);

    return (
        <div className="mt-6 bg-muted/30 rounded-2xl border border-border/60 p-6 space-y-6 animate-fade-in shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                <MapPin size={16} /> {lbl('Nueva dirección de entrega', 'New delivery address')}
            </h4>

            {/* Alias */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('Nombre / Alias', 'Name / Alias')}
                </label>
                <input
                    type="text"
                    required
                    placeholder={lbl('Ej: Oficina, Casa de Ana', "e.g. Office, Ana's house")}
                    value={alias}
                    onChange={e => setAlias(e.target.value)}
                    className="premium-input px-4 py-3"
                />
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {lbl('Dirección completa', 'Full address')}
                </label>
                <div className="relative group">
                    <textarea
                        required
                        rows={2}
                        placeholder={lbl('Calle, número, ciudad...', 'Street, number, city...')}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onBlur={() => { if (address.length > 5) forwardGeocode(); }}
                        className="premium-input px-4 py-3 pr-24 resize-none"
                    />
                    <button
                        type="button"
                        onClick={forwardGeocode}
                        disabled={isGeocoding}
                        className="absolute right-3 bottom-3 px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        {isGeocoding ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                        {lbl('Ubicar', 'Locate')}
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <MapIcon size={14} /> {lbl('Refina la ubicación en elmMapa', 'Refine location on the map')}
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setMarkerPos(centerNY);
                            map?.panTo(centerNY);
                            reverseGeocode(centerNY);
                        }}
                        className="text-[9px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                    >
                        <RotateCcw size={10} /> {lbl('Centrar en NY', 'Center on NY')}
                    </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-border shadow-inner">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={markerPos}
                            zoom={14}
                            options={mapOptions}
                            onClick={handleMapClick}
                            onLoad={m => setMap(m)}
                            onUnmount={() => setMap(null)}
                        >
                            <Marker
                                position={markerPos}
                                draggable={true}
                                onDragEnd={(e) => {
                                    if (e.latLng) {
                                        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                                        setMarkerPos(newPos);
                                        setRefinedPos(newPos);
                                        setIsManualAdjustment(true);
                                        reverseGeocode(newPos);
                                    }
                                }}
                            />
                        </GoogleMap>
                    ) : (
                        <div style={mapContainerStyle} className="bg-muted animate-pulse flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={30} />
                        </div>
                    )}
                </div>
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
                    className="premium-input px-4 py-3"
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
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                            saveMode === 'save'
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-border/50 text-muted-foreground hover:border-primary/20'
                        }`}
                    >
                        <BookmarkPlus size={14} />
                        {lbl('Guardar dirección', 'Save address')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSaveMode('temporary')}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                            saveMode === 'temporary'
                                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                                : 'border-border/50 text-muted-foreground hover:border-amber-300'
                        }`}
                    >
                        <Bookmark size={14} />
                        {lbl('Solo para este pedido', 'One-time only')}
                    </button>
                </div>
                {saveMode === 'temporary' && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 mt-2">
                        <p className="text-[9px] text-amber-600 font-bold flex items-center gap-1.5 leading-tight">
                            <AlertCircle size={12} />
                            {lbl(
                                'Esta dirección no aparecerá en tu perfil pero quedará registrada en el pedido.',
                                'This address won\'t appear in your profile but will be stored with the order.'
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main checkout page
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { cart, clearCart, updateQuantity, getRawSubtotal, getDiscountedSubtotal, getFinalTotal } = useCart();
    const { user, profile } = useAuth();
    const { locale } = useLanguage();
    const router = useRouter();

    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [isBeforeCutoff, setIsBeforeCutoff] = useState(true);
    const [showMinAmountModal, setShowMinAmountModal] = useState(false);
    const [minOrderAmount, setMinOrderAmount] = useState<number>(500);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

    // Delivery type
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('saved');
    const [otherAddrData, setOtherAddrData] = useState<{
        alias: string; address: string; notes: string; saveMode: 'save' | 'temporary';
        lat: number; lng: number; refined_lat: number | null; refined_lng: number | null;
    }>({ 
        alias: '', address: '', notes: '', saveMode: 'save',
        lat: centerNY.lat, lng: centerNY.lng, refined_lat: null, refined_lng: null
    });

    const lbl = (es: string, en: string) => locale === 'en' ? en : es;

    // Discounts
    const [userDiscounts, setUserDiscounts] = useState<any>(null);

    // ── Fetch user & discounts ──────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        setIsFetchingAddresses(true);
        
        // Parallel fetch for speed
        Promise.all([
            api.get(`/addresses/user/${user.id}`) as Promise<any[]>,
            api.get(`/users/${user.id}`).catch(() => null) // Includes general_discount and productDiscounts
        ]).then(([addrData, userData]) => {
            setAddresses(Array.isArray(addrData) ? addrData : []);
            if (addrData?.length > 0) setSelectedAddressId(addrData[0].id);
            setUserDiscounts(userData);
        }).finally(() => setIsFetchingAddresses(false));
    }, [user]);

    // ── Fetch min order amount configuration ──────────────────────────────────
    useEffect(() => {
        const userMin = (profile as any)?.min_order_amount;
        if (userMin !== null && userMin !== undefined && userMin !== '') {
            setMinOrderAmount(Number(userMin));
            return;
        }

        api.get('/configs/min_order_amount')
            .then((res: any) => {
                if (res && res.value) {
                    setMinOrderAmount(Number(res.value) || 500);
                }
            })
            .catch(err => console.error('Error fetching min_order_amount:', err));
    }, [profile]);

    // ── Calculation logic ─────────────────────────────────────────────────────
    const rawSubtotal = getRawSubtotal();
    const discountedSubtotal = getDiscountedSubtotal();
    const finalTotal = getFinalTotal();
    const totalDiscount = rawSubtotal - discountedSubtotal;
    const deliveryFee = profile?.delivery_fee || 0;
    const subtotal = rawSubtotal;

    // ── Payment method & Bank transfer ───────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'on_account'>('bank_transfer');
    const [paymentReference, setPaymentReference] = useState('');
    const [bankInfo, setBankInfo] = useState<{
        bankName?: string;
        accountHolder?: string;
        accountNumber?: string;
        routingNumber?: string;
        bankEmail?: string;
        bankNotes?: string;
    }>({});

    useEffect(() => {
        api.get('/configs/bank_transfer_info')
            .then((res: any) => {
                if (res && res.value) {
                    try {
                        const parsed = JSON.parse(res.value);
                        setBankInfo(parsed);
                    } catch (e) {
                        console.error('Error parsing bank_transfer_info:', e);
                    }
                }
            })
            .catch(err => console.error('Error fetching bank_transfer_info:', err));
    }, []);

    // ── Delivery date (NY timezone) & Selectable future date ───────────────────
    const [minDeliveryDate, setMinDeliveryDate] = useState<string>('');
    const [deliveryDateISO, setDeliveryDateISO] = useState<string>('');
    const [deliveryDateDisplay, setDeliveryDateDisplay] = useState<string>('');

    useEffect(() => {
        const nowNY = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const before = nowNY.getHours() < 13;
        const daysToAdd = before ? 2 : 3;
        const delDate = new Date(nowNY);
        delDate.setDate(nowNY.getDate() + daysToAdd);
        
        const iso = delDate.toISOString().split('T')[0];
        setMinDeliveryDate(iso);
        setDeliveryDateISO(iso);
        setIsBeforeCutoff(before);
        setDeliveryDate(iso);
        setDeliveryDateDisplay(delDate.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, [locale]);

    const handleQuickEditDate = () => {
        const el = document.getElementById('delivery-date-input');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!user || cart.length === 0) return;

        // Minimum order amount check
        if (finalTotal < minOrderAmount) {
            setShowMinAmountModal(true);
            return;
        }

        let finalAddressId: string | null = null;
        let deliveryAddressText: string | null = null;

        if (deliveryType === 'saved') {
            if (!selectedAddressId) {
                alert(t.checkout.selectAddress);
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
                    lat: otherAddrData.lat,
                    lng: otherAddrData.lng,
                    refined_lat: otherAddrData.refined_lat,
                    refined_lng: otherAddrData.refined_lng,
                }) as any;
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
                total: finalTotal,
                status: 'Pedido Enviado',
                deliveryDate,
                paymentDueDate: paymentDate,
                paymentGateway: paymentMethod,
                paymentTransactionId: paymentReference.trim() || null,
                paymentStatus: 'unpaid',
                items: cart.map(item => {
                    let unitPrice = item.originalPrice || item.price;
                    
                    // 1. Product-specific
                    const pd = profile?.productDiscounts?.find((d: any) => Number(d.product_id) === Number(item.id));
                    if (pd) {
                        if (pd.special_price) unitPrice = Number(pd.special_price);
                        else if (pd.discount_percentage) unitPrice = unitPrice * (1 - Number(pd.discount_percentage) / 100);
                    }
                    
                    // 2. General discount
                    if (profile?.general_discount > 0) {
                        unitPrice = unitPrice * (1 - Number(profile.general_discount) / 100);
                    }

                    return {
                        productId: item.id,
                        quantity: item.quantity,
                        price: Number(unitPrice.toFixed(2)),
                    };
                }),
            }) as any;
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

                        {/* ── Paso 1: Tipo de Entrega ──────────────────────── */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">1</span>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Truck className="text-primary" size={20} />
                                    {t.checkout.step1}
                                </h2>
                            </div>

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
                                            {t.checkout.pickupLocation}
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
                                            {t.checkout.selectAddress}:
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

                        {/* ── Paso 2: Fecha de Entrega ────────────────────── */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">2</span>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Calendar className="text-primary" size={22} />
                                    {t.checkout.step2}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                    isBeforeCutoff
                                        ? 'bg-green-500/10 text-green-700 border border-green-500/20'
                                        : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                }`}>
                                    <Clock size={12} />
                                    {isBeforeCutoff ? t.checkout.beforeCutoff : t.checkout.afterCutoff}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block px-1">
                                        {t.checkout.selectDeliveryDate}
                                    </label>
                                    <input
                                        id="delivery-date-input"
                                        type="date"
                                        min={minDeliveryDate}
                                        value={deliveryDateISO}
                                        onChange={e => {
                                            const iso = e.target.value;
                                            if (!iso) return;
                                            setDeliveryDateISO(iso);
                                            setDeliveryDate(iso);
                                            const parts = iso.split('-');
                                            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                                            setDeliveryDateDisplay(d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
                                        }}
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-primary/30 bg-primary/5 text-foreground font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                </div>

                                {deliveryDateDisplay && (
                                    <div className="p-4 bg-muted/40 rounded-2xl border border-border flex items-center gap-3">
                                        <Calendar className="text-primary shrink-0" size={20} />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">{t.checkout.selectedDate}:</p>
                                            <p className="text-sm font-bold text-foreground capitalize">{deliveryDateDisplay}</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    {t.checkout.dateNotice}
                                </p>
                            </div>
                        </section>

                        {/* ── Paso 3: Método de Pago ──────────────────────── */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">3</span>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CreditCard className="text-primary" size={20} />
                                    {t.checkout.step3}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                                        paymentMethod === 'bank_transfer'
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                                            : 'border-border hover:border-primary/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                            <CreditCard size={18} />
                                        </div>
                                        {paymentMethod === 'bank_transfer' && <Check size={16} className="text-primary font-bold" />}
                                    </div>
                                    <p className="font-black text-sm text-foreground">{t.checkout.payBankTransfer}</p>
                                    <p className="text-[11px] text-muted-foreground">{t.checkout.transferInstructions}</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('on_account')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                                        paymentMethod === 'on_account'
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                                            : 'border-border hover:border-primary/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'on_account' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                            <Store size={18} />
                                        </div>
                                        {paymentMethod === 'on_account' && <Check size={16} className="text-primary font-bold" />}
                                    </div>
                                    <p className="font-black text-sm text-foreground">{t.checkout.payOnAccount}</p>
                                    <p className="text-[11px] text-muted-foreground">{lbl('Facturación y cobro acordado', 'Agreed billing and settlement')}</p>
                                </button>
                            </div>

                            {/* Bank Details Display */}
                            {paymentMethod === 'bank_transfer' && (
                                <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/80 animate-fade-in">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                                        🏦 {t.checkout.bankDetailsTitle}
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {bankInfo.bankName && (
                                            <div className="bg-white p-3 rounded-xl border border-border">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground block">{t.checkout.bankName}</span>
                                                <span className="font-bold text-slate-800">{bankInfo.bankName}</span>
                                            </div>
                                        )}
                                        {bankInfo.accountHolder && (
                                            <div className="bg-white p-3 rounded-xl border border-border">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground block">{t.checkout.accountHolder}</span>
                                                <span className="font-bold text-slate-800">{bankInfo.accountHolder}</span>
                                            </div>
                                        )}
                                        {bankInfo.accountNumber && (
                                            <div className="bg-white p-3 rounded-xl border border-border">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground block">{t.checkout.accountNumber}</span>
                                                <span className="font-mono font-bold text-slate-800">{bankInfo.accountNumber}</span>
                                            </div>
                                        )}
                                        {bankInfo.routingNumber && (
                                            <div className="bg-white p-3 rounded-xl border border-border">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground block">{t.checkout.routingNumber}</span>
                                                <span className="font-mono font-bold text-slate-800">{bankInfo.routingNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {bankInfo.bankEmail && (
                                        <p className="text-[11px] text-muted-foreground">
                                            ✉️ <strong>Email:</strong> {bankInfo.bankEmail}
                                        </p>
                                    )}

                                    {bankInfo.bankNotes && (
                                        <p className="text-[11px] text-muted-foreground italic">
                                            ℹ️ {bankInfo.bankNotes}
                                        </p>
                                    )}

                                    <div className="pt-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">
                                            {t.checkout.referenceNumber}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={e => setPaymentReference(e.target.value)}
                                            placeholder={t.checkout.referencePlaceholder}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ── Paso 4: Notas ───────────────────────────────── */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">4</span>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {t.checkout.step4}
                                </h2>
                            </div>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={t.checkout.notes}
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-foreground font-medium text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </section>
                    </div>

                    {/* ── Right sidebar (Resumen Flotante) ─────────────────── */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl sticky top-28">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShoppingBag size={20} />
                                {t.checkout.summaryTitle}
                            </h2>

                            <div className="space-y-4 mb-8">
                                {cart.map(item => {
                                    let unitPrice = item.originalPrice || item.price;
                                    let hasPd = false;
                                    const pd = profile?.productDiscounts?.find((d: any) => Number(d.product_id) === Number(item.id));
                                    if (pd) {
                                        hasPd = true;
                                        if (pd.special_price) unitPrice = Number(pd.special_price);
                                        else if (pd.discount_percentage) unitPrice = unitPrice * (1 - Number(pd.discount_percentage) / 100);
                                    }

                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/40 gap-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-primary font-black uppercase tracking-widest">${unitPrice.toFixed(2)} c/u</span>
                                                    {hasPd && (
                                                        <span className="text-[8px] text-muted-foreground line-through">${(item.originalPrice || item.price).toFixed(2)}</span>
                                                    )}
                                                </div>
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
                                                    ${(unitPrice * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {cart.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4 italic">
                                        {lbl('Tu carrito está vacío', 'Your cart is empty')}
                                    </p>
                                )}

                                {/* Delivery type, Delivery Date & Payment badges in summary */}
                                <div className="pt-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                            deliveryType === 'pickup'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-primary/5 text-primary border-primary/20'
                                        }`}>
                                            {deliveryType === 'pickup'
                                                ? `🏪 ${t.checkout.deliveryTypePickup}`
                                                : `🚛 ${t.checkout.deliveryTypeSaved}`}
                                        </span>

                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                                            {paymentMethod === 'bank_transfer' ? '🏦 Transferencia' : '📦 En Cuenta'}
                                        </span>
                                    </div>

                                    {deliveryDateDisplay && (
                                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/80 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-primary shrink-0" />
                                                <div>
                                                    <span className="text-[9px] font-black uppercase text-muted-foreground block">{t.checkout.selectedDate}</span>
                                                    <span className="font-bold text-foreground capitalize">{deliveryDateDisplay}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleQuickEditDate}
                                                className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                {t.checkout.quickEditDate}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                 <div className="border-t border-border pt-4 flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="text-muted-foreground">{t.checkout.subtotal}</span>
                                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                                    </div>

                                    {deliveryFee > 0 && (
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-muted-foreground">{t.checkout.delivery}</span>
                                            <span className="font-bold text-amber-600">+${deliveryFee.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between items-center text-xs mb-3 text-green-600 bg-green-50/50 p-2 rounded-xl border border-green-100/50">
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase tracking-widest text-[9px]">{lbl('Descuento General', 'General Discount')}</span>
                                                <span className="text-[8px] italic">{lbl(`-${profile?.general_discount}% aplicado al subtotal`, `-${profile?.general_discount}% applied to subtotal`)}</span>
                                            </div>
                                            <span className="font-bold">-${totalDiscount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {finalTotal < minOrderAmount && (
                                        <div className="p-3 bg-red-50 rounded-xl border border-red-100 mb-2">
                                            <p className="text-[10px] text-red-600 font-black uppercase tracking-tight leading-tight">
                                                {`${t.checkout.minimumAmountNotice}: $${minOrderAmount.toFixed(2)}`}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-lg">{t.checkout.total}</span>
                                        <span className="text-3xl font-black text-primary">${finalTotal.toFixed(2)}</span>
                                    </div>

                                    {totalDiscount > 0 && (
                                        <div className="mt-4 p-5 bg-primary/5 rounded-[2.5rem] border border-primary/20 animate-pulse-slow">
                                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.1em] text-center leading-relaxed">
                                                {userDiscounts?.general_discount > 0 && !userDiscounts?.productDiscounts?.length ? (
                                                    lbl(
                                                        `✨ Descuento especial del ${userDiscounts.general_discount}%, que representa $${totalDiscount.toFixed(2)} en el total de su compra`,
                                                        `✨ Special ${userDiscounts.general_discount}% discount, representing $${totalDiscount.toFixed(2)} in your total purchase`
                                                    )
                                                ) : (
                                                    lbl(
                                                        `🎉 ¡Has ahorrado un total de $${totalDiscount.toFixed(2)} con tus descuentos exclusivos!`,
                                                        `🎉 You have saved a total of $${totalDiscount.toFixed(2)} with your exclusive discounts!`
                                                    )
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-[9px] text-muted-foreground font-bold mt-2 text-center">
                                        {`${t.checkout.minimumAmountNotice}: $${minOrderAmount.toFixed(2)}`}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || cart.length === 0}
                                className="w-full py-4 bg-[#111] hover:bg-[#222] text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {t.checkout.confirmAndPlaceOrder}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors"
                            >
                                {t.checkout.continueShopping}
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

            <MinimumAmountModal 
                isOpen={showMinAmountModal} 
                onClose={() => setShowMinAmountModal(false)} 
                locale={locale} 
                minOrderAmount={minOrderAmount}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimum Amount Modal
// ─────────────────────────────────────────────────────────────────────────────
function MinimumAmountModal({ isOpen, onClose, locale, minOrderAmount }: { isOpen: boolean; onClose: () => void; locale: string; minOrderAmount: number }) {
    const router = useRouter();
    if (!isOpen) return null;

    const lbl = (es: string, en: string) => locale === 'en' ? en : es;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card w-full max-w-md rounded-[32px] border border-border shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="text-primary" size={40} />
                </div>
                
                <h3 className="text-2xl font-black text-foreground mb-4">
                    {lbl('Monto Mínimo Requerido', 'Minimum Amount Required')}
                </h3>
                
                <p className="text-muted-foreground font-medium mb-8">
                    {lbl(
                        `Tu pedido actual es inferior a $${minOrderAmount.toFixed(2)}. Por favor, añade más productos para completar tu compra mínima.`,
                        `Your current order is below $${minOrderAmount.toFixed(2)}. Please add more items to complete your minimum purchase.`
                    )}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        {lbl('Volver al Catálogo', 'Back to Catalog')}
                        <ChevronRight size={16} />
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {lbl('Cerrar', 'Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
