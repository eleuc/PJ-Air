'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CategoryFilters } from '@/components/catalog/CategoryFilters';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';

const CATEGORIES = ['Todos', 'Croissants', 'Postres', 'Pasteles'];

export default function Home() {
    const { addToCart, cart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [addedIds, setAddedIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, any>>({});

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/products');
                
                if (data) {
                    setProducts(data);
                    const initialQuantities = data.reduce((acc: any, p: any) => ({ ...acc, [p.id]: 1 }), {});
                    setQuantities(initialQuantities);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const updateQuantity = (id: number, val: string) => {
        if (val === '') {
            setQuantities(prev => ({ ...prev, [id]: '' }));
            return;
        }
        const num = parseInt(val);
        setQuantities(prev => ({ ...prev, [id]: isNaN(num) ? '' : num }));
    };

    const handleIncrement = (id: number) => {
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    };

    const handleDecrement = (id: number) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));
    };

    const handleAddToCart = (product: Product) => {
        const qty = Number(quantities[product.id]) || 1;
        addToCart(product, qty);
        
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
    };

    const filteredProducts = products
        .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
        .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 px-2 min-h-[400px]">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando delicias...</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, idx) => {
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
                    })
                )}
                </div>
            </main>
        </div>
    );
}
