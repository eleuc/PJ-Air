'use client';

import React from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Info, Check, Edit3 } from 'lucide-react';
import { Product } from '@/lib/products';

interface ProductCardProps {
    product: Product;
    quantity: number;
    isInCart?: number;
    isJustAdded: boolean;
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
    onUpdateQuantity: (id: number, val: string) => void;
    onAddToCart: (product: Product) => void;
    animationDelay?: string;
}

export const ProductCard = ({
    product,
    quantity,
    isInCart,
    isJustAdded,
    onIncrement,
    onDecrement,
    onUpdateQuantity,
    onAddToCart,
    animationDelay
}: ProductCardProps) => {
    return (
        <div 
            className="group jhoanes-card bg-white/40 p-8 border-transparent hover:border-primary/10 hover:bg-white animate-slide-in flex flex-col h-full"
            style={{ animationDelay }}
        >
            {/* Image Section */}
            <Link href={`/catalog/${product.id}`} className="relative w-full mb-8 overflow-hidden rounded-[2.5rem] aspect-square bg-muted/30 flex items-center justify-center">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800';
                    }}
                />
                <div className="absolute top-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                        <Info size={20} />
                    </div>
                </div>
            </Link>

            {/* Info Section */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">{product.category}</span>
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4 tracking-tighter group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                
                {/* Price and Quantity Side by Side */}
                <div className="flex items-center justify-between gap-4 mt-auto mb-8 bg-muted/20 p-4 rounded-3xl border border-border/30">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Precio</span>
                        <span className="text-2xl font-semibold text-foreground tracking-tight">${product.price}</span>
                    </div>

                    <div className="h-10 w-[1px] bg-border/40 invisible sm:visible" />

                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                            Cantidad <Edit3 size={8} />
                        </span>
                        <div className="flex items-center bg-white border border-primary/20 rounded-xl p-0.5 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <button 
                                onClick={() => onDecrement(product.id)}
                                className="p-1 px-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Minus size={12} />
                            </button>
                            <input 
                                type="number" 
                                min="1"
                                value={quantity} 
                                onChange={(e) => onUpdateQuantity(product.id, e.target.value)}
                                title="Haga clic para editar cantidad"
                                className="w-8 bg-transparent text-center font-black text-xs outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer focus:bg-primary/5 rounded" 
                            />
                            <button 
                                onClick={() => onIncrement(product.id)}
                                className="p-1 px-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* In Cart Indicator */}
            {isInCart && (
                <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in">
                    <div className="h-[1px] flex-1 bg-green-500/20" />
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> En Carrito: {isInCart}
                    </span>
                    <div className="h-[1px] flex-1 bg-green-500/20" />
                </div>
            )}

            {/* Action Button at the Bottom */}
            <button 
                onClick={() => onAddToCart(product)}
                className={`w-full premium-button h-14 text-[10px] font-black uppercase tracking-[0.2em] gap-3 transition-all duration-500 rounded-2xl ${isJustAdded ? 'bg-green-500 text-white translate-y-[-2px] shadow-lg shadow-green-200' : 'jhoanes-gradient text-white hover:shadow-xl shadow-primary/20'}`}
            >
                {isJustAdded ? (
                    <><Check size={18} strokeWidth={3} /> ¡Agregado!</>
                ) : (
                    <><ShoppingCart size={18} strokeWidth={2.5} /> Añadir al Pedido</>
                )}
            </button>
        </div>
    );
};
