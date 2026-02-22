'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, ShoppingBag, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { getCartCount } = useCart();
    const { user, profile, signOut } = useAuth();
    const cartCount = getCartCount();

    return (
        <nav className="bg-white/90 backdrop-blur-xl border-b border-border/40 sticky top-0 z-[50]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex flex-col group">
                            <span className="text-2xl font-black tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">Jhoanes</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-0.5">Sistema de Pedidos</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-8 ml-8">
                            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 hover:text-primary transition-colors">Catalogo</Link>
                            <Link href="/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 hover:text-primary transition-colors">Pedidos</Link>
                            <Link href="/map" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Mapa</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-4 border-r border-border/40 pr-6 mr-2">
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors">
                                            Ingresar
                                        </Link>
                                        <Link href="/auth/register" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors">
                                            Registro
                                        </Link>
                                    </div>
                                    <div className="w-[1px] h-6 bg-border/40" />
                                    <div className="flex items-center gap-4">
                                        <Link href="/profile" className="flex flex-col items-end group/user">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/user:text-primary transition-colors">{user.email?.split('@')[0]}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    signOut();
                                                }}
                                                className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </Link>
                                        <Link href="/profile" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors">
                                        Ingresar
                                    </Link>
                                    <Link href="/auth/register" className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all">
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>

                        {user && (
                            <Link href="/orders" className="hidden sm:flex items-center gap-2 px-6 py-2 bg-muted/50 rounded-full border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">
                                Mis Pedidos
                            </Link>
                        )}

                        <div className="relative">
                            <Link href="/checkout" className="relative p-2.5 bg-foreground text-white rounded-full shadow-lg hover:bg-primary transition-all group overflow-hidden block">
                                <ShoppingBag size={18} className="relative z-10 group-hover:-translate-y-10 transition-transform duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                                    <Plus size={18} />
                                </div>
                            </Link>

                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 z-30 bg-[#6B0D0D] text-white text-[10px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-fade-in shadow-[#6B0D0D]/40">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        

                        <button className="p-2 text-foreground hover:bg-muted rounded-full transition-all lg:hidden">
                            <Menu size={22} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
