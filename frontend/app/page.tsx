'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { PRODUCTS, Product } from '@/lib/products';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CategoryFilters } from '@/components/catalog/CategoryFilters';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';

const CATEGORIES = ['Todos', 'Croissants', 'Postres', 'Pasteles'];

export default function Home() {
    const { addToCart, cart } = useCart();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>(
        PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
    );

    const updateQuantity = (id: number, val: string) => {
        const num = parseInt(val);
        setQuantities(prev => ({ ...prev, [id]: isNaN(num) || num < 1 ? 1 : num }));
    };

    const handleIncrement = (id: number) => {
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    };

    const handleDecrement = (id: number) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));
    };

    const handleAddToCart = (product: Product) => {
        const qty = quantities[product.id] || 1;
        addToCart(product, qty);
        
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
    };

    const filteredProducts = activeCategory === 'Todos' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-background border-none">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12 lg:px-12 animate-fade-in">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
                    <CatalogHeader />
                    <div className="mb-20">
                        <CategoryFilters 
                            categories={CATEGORIES} 
                            activeCategory={activeCategory} 
                            onCategoryChange={setActiveCategory} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-2">
                    {filteredProducts.map((product, idx) => {
                        const isInCart = cart.find(item => item.id === product.id)?.quantity;
                        const isJustAdded = addedIds.includes(product.id);

                        return (
                            <ProductCard 
                                key={product.id}
                                product={product}
                                quantity={quantities[product.id] || 1}
                                isInCart={isInCart}
                                isJustAdded={isJustAdded}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                                onUpdateQuantity={updateQuantity}
                                onAddToCart={handleAddToCart}
                                animationDelay={`${idx * 100}ms`}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
