'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Plus, Minus, ShoppingCart, Star, ArrowLeft, Check, ShieldCheck, Clock, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/lib/products';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = parseInt(resolvedParams.id);
    const product = PRODUCTS.find(p => p.id === productId);
    
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Producto no encontrado</div>;
    }

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background border-none">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12 lg:px-12 animate-fade-in">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
                    <ArrowLeft size={14} /> Volver al Catálogo
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Image Section */}
                    <div className="relative group">
                        <div className="jhoanes-card p-4 bg-white/50 backdrop-blur-md">
                            <div className="aspect-square rounded-[2rem] overflow-hidden bg-muted/30">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800';
                                    }}
                                />
                            </div>
                        </div>
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[100px]" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
                            <Star size={14} fill="currentColor" /> {product.category}
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black font-serif tracking-tighter text-foreground mb-6 leading-none">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="text-4xl font-semibold text-foreground tracking-tight">${product.price}</div>
                            <div className="h-8 w-[1px] bg-border/40" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-tight">
                                IVA INCLUIDO <br /> RECIÉN HORNEADO
                            </div>
                        </div>

                        <p className="text-lg text-muted-foreground font-medium mb-12 leading-relaxed max-w-xl">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-secondary/20 rounded-[2rem] border border-border/40">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Clock size={20} className="text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Listo en 1h</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 border-x border-border/40">
                                <Truck size={20} className="text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Delivery Express</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck size={20} className="text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Garantía Jhoanes</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch gap-4">
                            <div className="flex items-center bg-muted/30 border border-border/40 rounded-2xl p-2 h-16 px-4">
                                <button 
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    className="p-3 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 bg-transparent text-center font-black text-lg outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                />
                                <button 
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    className="p-3 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <button 
                                onClick={handleAddToCart}
                                className={`flex-1 premium-button h-16 text-xs uppercase tracking-[0.2em] gap-3 transition-all duration-500 ${isAdded ? 'bg-green-500 text-white' : 'jhoanes-gradient text-white'}`}
                            >
                                {isAdded ? (
                                    <><Check size={20} strokeWidth={3} /> ¡Agregado al Carrito!</>
                                ) : (
                                    <><ShoppingCart size={20} strokeWidth={2.5} /> Añadir al Pedido</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
