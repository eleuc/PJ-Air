'use client';

import React from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Info, Check } from 'lucide-react';
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
            className="group jhoanes-card bg-white/40 p-10 border-transparent hover:border-primary/10 hover:bg-white animate-slide-in"
            style={{ animationDelay }}
        >
            <Link href={`/catalog/${product.id}`} className="relative w-full mb-10 overflow-hidden rounded-[2.5rem] aspect-square bg-muted/30 flex items-center justify-center">
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

            <div className="w-full mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">{product.category}</span>
                </div>
                <h3 className="text-3xl font-bold font-serif mb-3 tracking-tighter group-hover:text-primary transition-colors">{product.name}</h3>
                
                <div className="flex items-end justify-between gap-4 mt-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Precio Unitario</span>
                        <span className="text-4xl font-black text-foreground tracking-tighter">${product.price}</span>
                    </div>
                    {isInCart && (
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl px-4 py-2">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">En Carrito: {isInCart}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full pt-8 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-muted/30 hover:bg-muted/50 border border-border/40 rounded-2xl p-1 transition-colors">
                        <button 
                            onClick={() => onDecrement(product.id)}
                            className="p-3 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <input 
                            type="number" 
                            min="1"
                            value={quantity} 
                            onChange={(e) => onUpdateQuantity(product.id, e.target.value)}
                            className="w-12 bg-transparent text-center font-black text-sm outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                        <button 
                            onClick={() => onIncrement(product.id)}
                            className="p-3 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button 
                        onClick={() => onAddToCart(product)}
                        className={`flex-1 premium-button text-[10px] uppercase tracking-[0.2em] gap-3 transition-all duration-500 ${isJustAdded ? 'bg-green-500 text-white' : 'jhoanes-gradient text-white'}`}
                    >
                        {isJustAdded ? (
                            <><Check size={16} strokeWidth={3} /> ¡Agregado!</>
                        ) : (
                            <><ShoppingCart size={16} strokeWidth={2.5} /> Agregar</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
