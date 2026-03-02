'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Tag, Search, ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function ProductCard({
    product, quantity, isInCart, isJustAdded, onIncrement, onDecrement, onAddToCart,
}: {
    product: any; quantity: number; isInCart?: number; isJustAdded: boolean;
    onIncrement: (id: number) => void; onDecrement: (id: number) => void; onAddToCart: (p: any) => void;
}) {
    const { t } = useLanguage();
    return (
        <div className="group bg-white rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden">
            <Link href={`/catalog/${product.id}`} className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 block">
                <img src={product.image} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=400'; }} />
                {isInCart ? (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={9} /> {isInCart}
                    </div>
                ) : null}
            </Link>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[40px]">{product.name}</h3>
                <p className="text-xl font-black text-foreground">${product.price}</p>
                <div className="flex items-center bg-muted/60 rounded-xl overflow-hidden border border-border/30">
                    <button onClick={() => onDecrement(product.id)} className="px-3 py-2 text-muted-foreground hover:text-primary transition-all"><Minus size={13} /></button>
                    <span className="flex-1 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => onIncrement(product.id)} className="px-3 py-2 text-muted-foreground hover:text-primary transition-all"><Plus size={13} /></button>
                </div>
                <button onClick={() => onAddToCart(product)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isJustAdded ? 'bg-green-500 text-white scale-95' : 'bg-primary text-white hover:bg-primary/90'}`}>
                    {isJustAdded ? <><Check size={12} /> {t.product.added}</> : <><ShoppingCart size={12} /> {t.product.addToOrder}</>}
                </button>
            </div>
        </div>
    );
}

export default function CategoryPage() {
    const params = useParams();
    const categoryKey = decodeURIComponent((params?.category as string) || '');

    const { addToCart, cart } = useCart();
    const { t, locale } = useLanguage();

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    useEffect(() => {
        let mounted = true;
        (async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/products');
                if (!mounted) return;
                setProducts(Array.isArray(data) ? data : []);
                setQuantities((data || []).reduce((acc: any, p: any) => ({ ...acc, [p.id]: 1 }), {}));
            } catch (err) { console.error(err); }
            finally { if (mounted) setIsLoading(false); }
        })();
        return () => { mounted = false; };
    }, []);

    // All categories (for the menu pills)
    const categoryGroups = useMemo(() => {
        const map: Record<string, string> = {};
        products.forEach(p => {
            if (p.category) map[p.category] = p.category_en || p.category;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, labelEn]) => ({
                key,
                label: locale === 'en' ? labelEn : key,
            }));
    }, [products, locale]);

    const categoryProducts = useMemo(() =>
        products.filter(p => p.category === categoryKey)
    , [products, categoryKey]);

    const categoryLabel = useMemo(() => {
        const first = categoryProducts[0];
        if (locale === 'en' && first?.category_en) return first.category_en;
        return categoryKey;
    }, [categoryProducts, categoryKey, locale]);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return categoryProducts;
        const q = searchQuery.toLowerCase();
        return categoryProducts.filter(p => p.name.toLowerCase().includes(q));
    }, [categoryProducts, searchQuery]);

    const handleIncrement = (id: number) => setQuantities(p => ({ ...p, [id]: (p[id] || 1) + 1 }));
    const handleDecrement = (id: number) => setQuantities(p => ({ ...p, [id]: Math.max(1, (p[id] || 1) - 1) }));
    const handleAddToCart = (product: any) => {
        addToCart(product, quantities[product.id] || 1);
        setAddedIds(p => [...p, product.id]);
        setTimeout(() => setAddedIds(p => p.filter(i => i !== product.id)), 2000);
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#fdfcfb 0%,#f9f6f0 100%)' }}>
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-10">

                {/* ── Same category pills + search bar as homepage ───── */}
                <div className="mb-8 flex flex-wrap items-center justify-end gap-2">

                    {/* Back link as first "pill" */}
                    <Link
                        href="/"
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted border border-border/50 text-[11px] font-black uppercase tracking-wider text-foreground/60 hover:bg-primary hover:text-white hover:border-primary shadow-sm transition-all"
                    >
                        <ArrowLeft size={13} />
                        {locale === 'en' ? 'All' : 'Todos'}
                    </Link>

                    {/* Category pills — active one highlighted */}
                    {!isLoading && categoryGroups.map(({ key, label }) => (
                        <Link
                            key={key}
                            href={`/catalog/category/${encodeURIComponent(key)}`}
                            className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm transition-all border ${
                                key === categoryKey
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white border-border/50 text-foreground/60 hover:bg-primary hover:text-white hover:border-primary'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* Divider */}
                    <div className="h-6 w-px bg-border/50 shrink-0 hidden sm:block" />

                    {/* Search — rightmost */}
                    <div className="relative shrink-0" style={{ width: 'min(100%, 220px)' }}>
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder={t.catalog.searchPlaceholder}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white border border-border/60 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all shadow-sm placeholder:text-muted-foreground/50"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-xs font-bold">✕</button>
                        )}
                    </div>
                </div>

                {/* ── Category title ──────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                        <Tag size={18} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight leading-none">{categoryLabel}</h1>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                            {isLoading ? '...' : `${categoryProducts.length} ${locale === 'en' ? 'products' : 'productos'}`}
                        </p>
                    </div>
                </div>

                {/* ── Products ─────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="flex flex-col items-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">{t.catalog.loading}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-3xl border border-border/40">
                        <p className="text-muted-foreground font-medium">{t.catalog.noProducts}</p>
                        <Link href="/" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
                            {locale === 'en' ? '← Back to catalog' : '← Volver al catálogo'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4"
                         style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,200px),1fr))' }}>
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product}
                                quantity={quantities[product.id] || 1}
                                isInCart={cart.find(i => i.id === product.id)?.quantity}
                                isJustAdded={addedIds.includes(product.id)}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
