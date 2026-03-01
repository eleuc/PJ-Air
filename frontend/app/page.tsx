'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import { api } from '@/lib/api';
import { ProductCardCompact } from '@/components/catalog/ProductCardCompact';
import { useLanguage } from '@/context/LanguageContext';
import { Search, ArrowRight, Tag, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CategoryGroup {
    key: string;       // ES canonical name (matches product.category in DB)
    label: string;     // Display name in active locale
    products: Product[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
    const { addToCart, cart } = useCart();
    const { t, locale } = useLanguage();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // ── Fetch products ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/products');
                if (data) {
                    setProducts(data);
                    const initialQty = data.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 1 }), {});
                    setQuantities(initialQty);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // ── Cart helpers ───────────────────────────────────────────────────────
    const handleIncrement = (id: number) =>
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));

    const handleDecrement = (id: number) =>
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));

    const handleAddToCart = (product: Product) => {
        const qty = quantities[product.id] || 1;
        addToCart(product, qty);
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
    };

    // ── Build category groups ──────────────────────────────────────────────
    const categoryGroups = useMemo((): CategoryGroup[] => {
        const map: Record<string, { label_en: string; products: Product[] }> = {};
        products.forEach(p => {
            if (!p.category) return;
            if (!map[p.category]) {
                map[p.category] = {
                    label_en: (p as any).category_en || p.category,
                    products: [],
                };
            }
            map[p.category].products.push(p);
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, { label_en, products }]) => ({
                key,
                label: locale === 'en' ? label_en : key,
                products,
            }));
    }, [products, locale]);

    // ── Search filtered products (flat list) ───────────────────────────────
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            ((p as any).category_en || '').toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const isSearching = !!searchQuery.trim();

    // ── Promotions — lowest price products (first 4) ────────────────────────
    const promotions = useMemo(() =>
        [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 8)
    , [products]);

    // ── Unique category labels for the top filter bar ──────────────────────
    const categoryLabels = categoryGroups.map(g => g.label);

    return (
        <div className="min-h-screen bg-[#fafaf8]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

                {/* ── Hero search bar + category pills ───────────────────── */}
                <div className="mb-10">
                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-none">
                            {locale === 'en' ? 'Our Bakery' : 'Nuestra Panadería'}
                        </h1>
                        <p className="text-muted-foreground font-medium mt-2">
                            {locale === 'en'
                                ? 'Fresh baked goods, delivered to your door'
                                : 'Delicias frescas, en tu puerta'}
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xl mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t.catalog.searchPlaceholder}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-border/50 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm placeholder:text-muted-foreground/60"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category pills */}
                    {!isLoading && categoryLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categoryLabels.map(label => (
                                <a
                                    key={label}
                                    href={`#cat-${label.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="px-5 py-2 rounded-full bg-white border border-border/60 text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Loading ─────────────────────────────────────────────── */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                            {t.catalog.loading}
                        </p>
                    </div>
                )}

                {/* ── Search Results ──────────────────────────────────────── */}
                {!isLoading && isSearching && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">
                                    {t.catalog.searchResults}: <span className="text-primary">"{searchQuery}"</span>
                                </h2>
                                <p className="text-sm text-muted-foreground mt-0.5">{searchResults.length} {locale === 'en' ? 'results' : 'resultados'}</p>
                            </div>
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="py-16 text-center bg-white rounded-3xl border border-border/40">
                                <p className="text-muted-foreground font-medium">{t.catalog.noProducts}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {searchResults.map((product, idx) => (
                                    <ProductCardCompact
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

                {/* ── Category Sections ───────────────────────────────────── */}
                {!isLoading && !isSearching && categoryGroups.map((group, gIdx) => (
                    <section
                        key={group.key}
                        id={`cat-${group.label.replace(/\s+/g, '-').toLowerCase()}`}
                        className="mb-16 scroll-mt-24"
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight leading-none">{group.label}</h2>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {group.products.length} {locale === 'en' ? 'products' : 'productos'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/catalog/category/${encodeURIComponent(group.key)}`}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border/50 rounded-full text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                            >
                                {t.catalog.viewAll}
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Horizontal scrollable row — show first 4 */}
                        {group.products.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-8 text-center bg-white rounded-2xl border border-border/40">
                                {t.catalog.noProductsInCategory}
                            </p>
                        ) : (
                            <>
                                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    {group.products.slice(0, 4).map((product, idx) => (
                                        <div key={product.id} className="snap-start shrink-0">
                                            <ProductCardCompact
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

                                    {/* "See all" card */}
                                    {group.products.length > 4 && (
                                        <Link
                                            href={`/catalog/category/${encodeURIComponent(group.key)}`}
                                            className="snap-start shrink-0 w-[160px] rounded-[2rem] bg-primary/5 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all group/more"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 group-hover/more:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                                <ArrowRight size={22} />
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-center px-4">
                                                +{group.products.length - 4} {locale === 'en' ? 'more' : 'más'}
                                            </p>
                                        </Link>
                                    )}
                                </div>

                                {/* Divider line */}
                                {gIdx < categoryGroups.length - 1 && (
                                    <div className="mt-10 border-t border-border/30" />
                                )}
                            </>
                        )}
                    </section>
                ))}

                {/* ── Promotions Section ──────────────────────────────────── */}
                {!isLoading && !isSearching && promotions.length > 0 && (
                    <section className="mt-8 mb-16">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">{t.catalog.promotions}</h2>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">{t.catalog.promotionsSubtitle}</p>
                            </div>
                        </div>

                        {/* Promo banner */}
                        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6B0D0D] via-[#9b1c1c] to-[#c2410c] p-8 mb-8 text-white">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }} />
                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 flex items-center gap-2">
                                        <Sparkles size={10} /> {locale === 'en' ? 'Special Offers' : 'Ofertas Especiales'}
                                    </p>
                                    <h3 className="text-3xl font-black tracking-tight">{t.catalog.promotions}</h3>
                                    <p className="text-white/70 mt-1 text-sm">{t.catalog.promotionsSubtitle}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20">
                                    <Tag size={18} />
                                    <span className="font-black text-sm uppercase tracking-widest">
                                        {locale === 'en' ? 'Best Prices' : 'Mejores Precios'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Promo products horizontal scroll */}
                        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            {promotions.map(product => (
                                <div key={product.id} className="snap-start shrink-0 relative">
                                    {/* Sale badge */}
                                    <div className="absolute top-2 left-2 z-10 bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                                        <Sparkles size={9} /> {locale === 'en' ? 'Promo' : 'Promo'}
                                    </div>
                                    <ProductCardCompact
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
