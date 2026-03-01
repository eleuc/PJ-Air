'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import { api } from '@/lib/api';
import { ProductCardCompact } from '@/components/catalog/ProductCardCompact';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Tag, Search } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
    const params = useParams();
    const categoryKey = decodeURIComponent(params?.category as string || '');

    const { addToCart, cart } = useCart();
    const { t, locale } = useLanguage();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/products');
                if (data) {
                    setProducts(data);
                    const initialQty = data.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 1 }), {});
                    setQuantities(initialQty);
                }
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetch();
    }, []);

    // Filtra por categoría
    const categoryProducts = useMemo(() =>
        products.filter(p => p.category === categoryKey)
    , [products, categoryKey]);

    // Label del idioma activo
    const categoryLabel = useMemo(() => {
        const first = categoryProducts[0] as any;
        if (locale === 'en' && first?.category_en) return first.category_en;
        return categoryKey;
    }, [categoryProducts, categoryKey, locale]);

    // Search filter
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return categoryProducts;
        const q = searchQuery.toLowerCase();
        return categoryProducts.filter(p => p.name.toLowerCase().includes(q));
    }, [categoryProducts, searchQuery]);

    const handleIncrement = (id: number) =>
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));

    const handleDecrement = (id: number) =>
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));

    const handleAddToCart = (product: Product) => {
        addToCart(product, quantities[product.id] || 1);
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
    };

    return (
        <div className="min-h-screen bg-[#fafaf8]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

                {/* Back + Title */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft size={14} /> {locale === 'en' ? 'Back to catalog' : 'Volver al catálogo'}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Tag size={22} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">{categoryLabel}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {isLoading ? '...' : `${categoryProducts.length} ${locale === 'en' ? 'products' : 'productos'}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder={t.catalog.searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-border/50 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.catalog.loading}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-3xl border border-border/40">
                        <p className="text-muted-foreground font-medium">{t.catalog.noProducts}</p>
                        <Link href="/" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
                            {locale === 'en' ? '← Back to catalog' : '← Volver al catálogo'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filtered.map(product => (
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
            </main>
        </div>
    );
}
