'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import QuantitySelector from '@/components/ui/QuantitySelector';

interface ProductCardProps {
    product: any;
    quantity: number | string;
    isInCart?: number;
    isJustAdded: boolean;
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
    onQuantityChange: (id: number, val: string) => void;
    onAddToCart: (product: any) => void;
    profile?: any;
}

export default function ProductCard({
    product,
    quantity,
    isInCart,
    isJustAdded,
    onIncrement,
    onDecrement,
    onQuantityChange,
    onAddToCart,
    profile,
}: ProductCardProps) {
    const { t, locale } = useLanguage();

    // Calculate dynamic price
    const originalPrice = Number(product.price) || 0;
    let finalPrice = originalPrice;
    let hasDiscount = false;

    if (profile?.productDiscounts) {
        const pd = profile.productDiscounts.find((d: any) => Number(d.product_id) === Number(product.id));
        if (pd) {
            hasDiscount = true;
            if (pd.special_price) finalPrice = Number(pd.special_price);
            else if (pd.discount_percentage) finalPrice = originalPrice * (1 - Number(pd.discount_percentage) / 100);
        }
    }
    
    if (!hasDiscount && profile?.general_discount > 0) {
        hasDiscount = true;
        finalPrice = originalPrice * (1 - Number(profile.general_discount) / 100);
    }

    return (
        <div className="group bg-white rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden w-full h-full">
            {/* Image */}
            <Link
                href={`/catalog/${product.id}`}
                className="relative w-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 block"
                style={{ aspectRatio: '1/1' }}
            >
                <img
                    src={product.image?.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=400';
                    }}
                />
                {!!isInCart && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow">
                        <Check size={9} strokeWidth={3} /> {isInCart}
                    </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg">
                        <Info size={17} className="text-primary" />
                    </div>
                </div>
            </Link>

            {/* Details */}
            <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[36px]">
                    {product.name}
                </h3>
                <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-lg font-black text-foreground tracking-tight">${finalPrice.toFixed(2)}</p>
                    {hasDiscount && (
                        <p className="text-[10px] font-bold text-muted-foreground/60 line-through decoration-primary/40 decoration-2">${originalPrice.toFixed(2)}</p>
                    )}
                </div>
                {product.category_min_qty > 1 && (
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <Info size={10} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-tight">
                            {locale === 'en' ? `Min: ${product.category_min_qty} units` : `Mínimo: ${product.category_min_qty} unidades`}
                        </span>
                    </div>
                )}

                {/* Quantity */}
                <QuantitySelector
                    quantity={quantity}
                    onIncrement={() => onIncrement(product.id)}
                    onDecrement={() => onDecrement(product.id)}
                    onManualChange={(val) => onQuantityChange(product.id, val)}
                    variant="card"
                />

                {/* Cart button */}
                <button
                    onClick={() => onAddToCart(product)}
                    className={`mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isJustAdded
                            ? 'bg-green-500 text-white scale-95'
                            : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                    }`}
                >
                    {isJustAdded
                        ? <><Check size={12} strokeWidth={3} /> {t.product.added}</>
                        : <><ShoppingCart size={12} /> {t.product.addToOrder}</>}
                </button>
            </div>
        </div>
    );
}
