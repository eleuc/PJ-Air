'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
    Search, ArrowRight, Tag, ChevronRight, Sparkles,
    ShoppingCart, Check, Plus, Minus, Info
} from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Inline compact product card (avoids import issues)
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({
    product,
    quantity,
    isInCart,
    isJustAdded,
    onIncrement,
    onDecrement,
    onAddToCart,
}: {
    product: any;
    quantity: number;
    isInCart?: number;
    isJustAdded: boolean;
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
    onAddToCart: (p: any) => void;
}) {
    const { t, locale } = useLanguage();

    return (
        <div className="group bg-white rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden w-[200px] sm:w-[220px] shrink-0">
            {/* Image */}
            <Link href={`/catalog/${product.id}`} className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=400';
                    }}
                />
                {/* Cart badge */}
                {isInCart ? (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Check size={9} strokeWidth={3} /> {isInCart}
                    </div>
                ) : null}
                {/* Info hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg">
                        <Info size={18} className="text-primary" />
                    </div>
                </div>
            </Link>

            {/* Info */}
            <div className="p-3.5 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-[13px] leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[36px]">
                    {product.name}
                </h3>
                <p className="text-lg font-black text-foreground/90 tracking-tight">${product.price}</p>

                {/* Qty controls */}
                <div className="flex items-center bg-muted/60 rounded-xl overflow-hidden border border-border/30 mt-1">
                    <button
                        onClick={() => onDecrement(product.id)}
                        className="px-2.5 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="flex-1 text-center text-sm font-bold">{quantity}</span>
                    <button
                        onClick={() => onIncrement(product.id)}
                        className="px-2.5 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        <Plus size={13} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Add to cart */}
                <button
                    onClick={() => onAddToCart(product)}
                    className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isJustAdded
                            ? 'bg-green-500 text-white scale-95'
                            : 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02]'
                    }`}
                >
                    {isJustAdded ? (
                        <><Check size={12} strokeWidth={3} /> {t.product.added}</>
                    ) : (
                        <><ShoppingCart size={12} strokeWidth={2.5} /> {t.product.addToOrder}</>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
    const { addToCart, cart } = useCart();
    const { t, locale } = useLanguage();

    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // ── Fetch products once ────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const fetchProducts = async () => {
            setIsLoading(true);
            setFetchError('');
            try {
                const data = await api.get('/products');
                if (!mounted) return;
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
                    const q = data.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 1 }), {});
                    setQuantities(q);
                } else {
                    setFetchError('empty');
                }
            } catch (err: any) {
                if (!mounted) return;
                console.error('Fetch products error:', err);
                setFetchError(err.message || 'error');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        fetchProducts();
        return () => { mounted = false; };
    }, []);

    // ── Cart helpers ───────────────────────────────────────────────────────
    const handleIncrement = (id: number) =>
        setQuantities(p => ({ ...p, [id]: (p[id] || 1) + 1 }));

    const handleDecrement = (id: number) =>
        setQuantities(p => ({ ...p, [id]: Math.max(1, (p[id] || 1) - 1) }));

    const handleAddToCart = (product: any) => {
        addToCart(product, quantities[product.id] || 1);
        setAddedIds(p => [...p, product.id]);
        setTimeout(() => setAddedIds(p => p.filter(i => i !== product.id)), 2000);
    };

    // ── Build category groups, sorted alphabetically ───────────────────────
    const categoryGroups = useMemo(() => {
        const map: Record<string, { labelEn: string; items: any[] }> = {};
        products.forEach(p => {
            const key = p.category || 'Other';
            if (!map[key]) map[key] = { labelEn: p.category_en || key, items: [] };
            map[key].items.push(p);
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, { labelEn, items }]) => ({
                key,
                label: locale === 'en' ? labelEn : key,
                labelEn,
                products: items,
            }));
    }, [products, locale]);

    // ── Search ─────────────────────────────────────────────────────────────
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.category_en || '').toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    // ── Promotions: random 6 lower-priced products (different each visit) ──
    const promotions = useMemo(() => {
        if (products.length === 0) return [];
        const sorted = [...products].sort((a, b) =>
            parseFloat(String(a.price).replace(',', '.')) - parseFloat(String(b.price).replace(',', '.'))
        );
        // Take first 12 cheapest, shuffle, pick 6
        const pool = sorted.slice(0, Math.min(12, sorted.length));
        return pool.sort(() => Math.random() - 0.5).slice(0, 6);
    }, [products]);

    // ── Category anchor labels ─────────────────────────────────────────────
    const catLabels = categoryGroups.map(g => ({ key: g.key, label: g.label }));

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fdfcfb 0%, #f9f6f0 100%)' }}>
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

                {/* ── Header ────────────────────────────────────────────── */}
                <div className="mb-10">
                    <div className="mb-5">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-foreground">
                            {locale === 'en' ? (
                                <><span className="text-primary">JH</span> Bakery</>
                            ) : (
                                <><span className="text-primary">JH</span> Panadería</>
                            )}
                        </h1>
                        <p className="text-muted-foreground font-medium mt-2 text-base">
                            {locale === 'en'
                                ? 'Fresh baked goods & pastries, delivered to your door'
                                : 'Delicias frescas de panadería y repostería, a tu puerta'}
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="relative max-w-lg mb-5">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={17} />
                        <input
                            type="text"
                            placeholder={t.catalog.searchPlaceholder}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-border/60 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all shadow-sm placeholder:text-muted-foreground/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category quick-jump pills */}
                    {!isLoading && catLabels.length > 0 && !isSearching && (
                        <div className="flex flex-wrap gap-2">
                            {catLabels.map(({ key, label }) => (
                                <a
                                    key={key}
                                    href={`#cat-${key}`}
                                    className="px-4 py-2 rounded-full bg-white border border-border/50 text-[11px] font-black uppercase tracking-wider text-foreground/60 hover:bg-primary hover:text-white hover:border-primary shadow-sm transition-all"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Loading ────────────────────────────────────────────── */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-40 gap-5">
                        <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                            {t.catalog.loading}
                        </p>
                    </div>
                )}

                {/* ── Error / Empty ──────────────────────────────────────── */}
                {!isLoading && fetchError && (
                    <div className="rounded-3xl bg-red-50 border border-red-100 p-10 text-center">
                        <p className="text-red-600 font-bold mb-2">
                            {locale === 'en' ? 'Could not load products' : 'No se pudieron cargar los productos'}
                        </p>
                        <p className="text-red-400 text-sm">
                            {fetchError === 'empty'
                                ? (locale === 'en' ? 'The catalog is empty.' : 'El catálogo está vacío.')
                                : fetchError}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-bold"
                        >
                            {locale === 'en' ? 'Retry' : 'Reintentar'}
                        </button>
                    </div>
                )}

                {/* ── Search Results ─────────────────────────────────────── */}
                {!isLoading && !fetchError && isSearching && (
                    <section className="mb-14">
                        <div className="mb-5">
                            <h2 className="text-xl font-black">
                                {t.catalog.searchResults}: <span className="text-primary">"{searchQuery}"</span>
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {searchResults.length} {locale === 'en' ? 'results' : 'resultados'}
                            </p>
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="py-16 text-center bg-white rounded-3xl border border-border/40">
                                <p className="text-muted-foreground font-medium">{t.catalog.noProducts}</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {searchResults.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
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
                    </section>
                )}

                {/* ── Category Sections (3 products each) ───────────────── */}
                {!isLoading && !fetchError && !isSearching && categoryGroups.map((group, gIdx) => (
                    <section
                        key={group.key}
                        id={`cat-${group.key}`}
                        className="mb-14 scroll-mt-24"
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight leading-none">
                                        {group.label}
                                    </h2>
                                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                                        {group.products.length} {locale === 'en' ? 'products' : 'productos'}
                                    </p>
                                </div>
                            </div>

                            {/* View all */}
                            <Link
                                href={`/catalog/category/${encodeURIComponent(group.key)}`}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border/50 rounded-full text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn shadow-sm"
                            >
                                {t.catalog.viewAll}
                                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        {/* 3 products + "See all" card (only if more than 3) */}
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
                             style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

                            {group.products.slice(0, 3).map(product => (
                                <div key={product.id} className="shrink-0">
                                    <ProductCard
                                        product={product}
                                        quantity={quantities[product.id] || 1}
                                        isInCart={cart.find(i => i.id === product.id)?.quantity}
                                        isJustAdded={addedIds.includes(product.id)}
                                        onIncrement={handleIncrement}
                                        onDecrement={handleDecrement}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>
                            ))}

                            {/* "More" card shown if category has >3 items */}
                            {group.products.length > 3 && (
                                <Link
                                    href={`/catalog/category/${encodeURIComponent(group.key)}`}
                                    className="shrink-0 w-[140px] sm:w-[160px] rounded-3xl bg-primary/5 border-2 border-dashed border-primary/25 flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group/more min-h-[280px]"
                                >
                                    <div className="w-12 h-12 bg-primary/10 group-hover/more:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                        <ArrowRight size={24} />
                                    </div>
                                    <p className="text-center px-3 text-[11px] font-black uppercase tracking-widest leading-tight">
                                        +{group.products.length - 3}<br/>
                                        {locale === 'en' ? 'more' : 'más'}
                                    </p>
                                </Link>
                            )}
                        </div>

                        {/* Divider between categories */}
                        {gIdx < categoryGroups.length - 1 && (
                            <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        )}
                    </section>
                ))}

                {/* ── Promotions ─────────────────────────────────────────── */}
                {!isLoading && !fetchError && !isSearching && promotions.length > 0 && (
                    <section className="mt-4 mb-16">
                        {/* Promo banner */}
                        <div className="relative overflow-hidden rounded-[2rem] mb-6 p-7 sm:p-10"
                             style={{ background: 'linear-gradient(135deg, #6B0D0D 0%, #9b1c1c 50%, #b45309 100%)' }}>
                            <div
                                className="absolute inset-0 opacity-[0.07]"
                                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}
                            />
                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-amber-300" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                            {locale === 'en' ? 'Special Offers' : 'Ofertas Especiales'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                                        {t.catalog.promotions}
                                    </h2>
                                    <p className="text-white/60 mt-2 text-sm">{t.catalog.promotionsSubtitle}</p>
                                </div>
                                <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center gap-2 shrink-0">
                                    <Tag size={16} className="text-amber-300" />
                                    <span className="font-black text-sm uppercase tracking-widest text-white">
                                        {locale === 'en' ? 'Best Prices' : 'Mejores Precios'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Promo products row */}
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
                             style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
                            {promotions.map(product => (
                                <div key={`promo-${product.id}`} className="shrink-0 relative">
                                    {/* Badge */}
                                    <div className="absolute top-2 left-2 z-20 bg-amber-400 text-white text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                                        <Sparkles size={8} /> {locale === 'en' ? 'Deal' : 'Oferta'}
                                    </div>
                                    <ProductCard
                                        product={product}
                                        quantity={quantities[product.id] || 1}
                                        isInCart={cart.find(i => i.id === product.id)?.quantity}
                                        isJustAdded={addedIds.includes(product.id)}
                                        onIncrement={handleIncrement}
                                        onDecrement={handleDecrement}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}
