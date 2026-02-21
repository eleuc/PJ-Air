'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Plus, Minus, ShoppingCart, Star, ArrowLeft, Check, ShieldCheck, Clock, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Croissant Clásico', category: 'Croissants', price: 25, description: 'Nuestro croissant francés tradicional, elaborado con mantequilla pura y fermentación lenta de 24 horas. Capas crujientes por fuera y un corazón tierno y aireado por dentro.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800' },
    { id: 2, name: 'Croissant de Almendra', category: 'Croissants', price: 30, description: 'Relleno de una exquisita crema de almendra y cubierto con láminas de almendra tostada y un toque de azúcar glas.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800' },
    { id: 3, name: 'Croissant de Chocolate', category: 'Croissants', price: 32, description: 'Para los amantes del cacao, relleno con barras de chocolate belga de alta calidad que se funden perfectamente en cada bocado.', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=800' },
    { id: 4, name: 'Tiramisu', category: 'Postres', price: 65, description: 'Un clásico italiano con capas de bizcocho soletilla empapado en café espresso, crema de mascarpone y un toque final de cacao puro.', image: 'https://images.unsplash.com/photo-1571877223202-cd884ca0a76a?q=80&w=800' },
    { id: 5, name: 'Cheesecake', category: 'Postres', price: 70, description: 'Cheesecake horneado estilo Nueva York, con una base crujiente de galleta y una textura cremosa incomparable.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800' },
    { id: 6, name: 'Panna Cotta', category: 'Postres', price: 55, description: 'Delicado postre de nata cocida con vainilla natural, servido con una reducción de frutos rojos frescos.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800' },
    { id: 7, name: 'Cake de Chocolate', category: 'Pasteles', price: 45, description: 'Intenso bizcocho de chocolate oscuro con frosting de ganache de chocolate. El sueño de cualquier chocolatero.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800' },
    { id: 8, name: 'Cake Red Velvet', category: 'Pasteles', price: 50, description: 'Bizcocho aterciopelado de color rojo profundo con un suave toque de cacao y relleno de frosting de queso crema.', image: 'https://images.unsplash.com/photo-1586788680434-30d324634467?q=80&w=800' },
    { id: 9, name: 'Cake de Zanahoria', category: 'Pasteles', price: 48, description: 'Pastel de zanahoria especiado con nueces y especias cálidas, cubierto con nuestra famosa crema de queso.', image: 'https://images.unsplash.com/photo-1536816579748-4fcb33e14724?q=80&w=800' },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = parseInt(resolvedParams.id);
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>;
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
                                />
                            </div>
                        </div>
                        {/* Decorative background element */}
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
                            <div className="text-5xl font-black text-foreground tracking-tighter">${product.price}</div>
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

                        <div className="mt-12 space-y-4 pt-8 border-t border-border/40">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Check size={16} className="text-green-500" />
                                <span className="text-xs font-medium">Ingredientes 100% orgánicos</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Check size={16} className="text-green-500" />
                                <span className="text-xs font-medium">Sin conservantes ni colorantes artificiales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
