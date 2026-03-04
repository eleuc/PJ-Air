'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: number;
    name: string;
    price: number; // This will be the dynamic final price
    originalPrice: number; // Fixed base price from catalog
    quantity: number;
    image: string;
    description: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
    getRawSubtotal: () => number;
    getDiscountedSubtotal: () => number;
    getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    
    // Key depends on user ID to isolate carts
    const cartKey = profile?.id ? `jhoanes-cart-${profile.id}` : 'jhoanes-cart-guest';

    // Load from localStorage when user changes or component mounts
    useEffect(() => {
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error loading cart", e);
                setCart([]);
            }
        } else {
            setCart([]);
        }
    }, [cartKey]);

    // Save to localStorage on cart change
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        } else {
            localStorage.removeItem(cartKey);
        }
    }, [cart, cartKey]);

    const addToCart = (product: any, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                originalPrice: product.price,
                image: product.image,
                description: product.description,
                quantity: quantity 
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item => 
                item.id === productId ? { ...item, quantity } : item
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getRawSubtotal = () => {
        return cart.reduce((total, item) => {
            let itemPrice = item.originalPrice || item.price;
            
            // Apply product-specific discount (Step 1)
            if (profile?.productDiscounts) {
                const pd = profile.productDiscounts.find((d: any) => Number(d.product_id) === Number(item.id));
                if (pd) {
                    if (pd.special_price) {
                        itemPrice = Number(pd.special_price);
                    } else if (pd.discount_percentage) {
                        itemPrice = itemPrice * (1 - Number(pd.discount_percentage) / 100);
                    }
                }
            }
            
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    const getCartTotal = () => getRawSubtotal();

    const getDiscountedSubtotal = () => {
        const sub = getRawSubtotal();
        // Applying general discount (Step 2)
        const genDisc = profile?.general_discount || 0;
        return sub * (1 - Number(genDisc) / 100);
    };

    const getFinalTotal = () => {
        const afterDisc = getDiscountedSubtotal();
        // Adding delivery fee (Step 3)
        const fee = profile?.delivery_fee || 0;
        return afterDisc + Number(fee);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity,
            clearCart, 
            getCartTotal, 
            getCartCount,
            getRawSubtotal,
            getDiscountedSubtotal,
            getFinalTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
