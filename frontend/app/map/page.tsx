'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
    Home,
    LogIn,
    UserPlus,
    ShoppingBag,
    MapPin,
    CreditCard,
    ClipboardList,
    ArrowRight,
    Search,
    ChevronRight,
    Star
} from 'lucide-react';

interface NavigationNode {
    title: string;
    icon: React.ReactNode;
    href: string;
    note?: string;
}

interface FlowSection {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    href?: string;
    type?: 'entry';
    children?: NavigationNode[];
}

const FLOW_NODES: FlowSection[] = [
    {
        id: 'start',
        title: 'Inicio',
        description: 'Página principal y Landing',
        icon: <Home size={24} />,
        href: '/',
        type: 'entry'
    },
    {
        id: 'auth',
        title: 'Autenticación',
        children: [
            { title: 'Login', icon: <LogIn size={18} />, href: '/auth/login' },
            { title: 'Registro', icon: <UserPlus size={18} />, href: '/auth/register' }
        ]
    },
    {
        id: 'onboarding',
        title: 'Onboarding',
        children: [
            { title: 'Nueva Dirección', icon: <MapPin size={18} />, href: '/profile/addresses/new', note: 'Requiere Login' }
        ]
    },
    {
        id: 'core',
        title: 'Exploración',
        children: [
            { title: 'Catálogo', icon: <Search size={18} />, href: '/catalog' },
            { title: 'Detalle Producto', icon: <Star size={18} />, href: '/catalog/1' }
        ]
    },
    {
        id: 'commerce',
        title: 'Transacción',
        children: [
            { title: 'Checkout', icon: <CreditCard size={18} />, href: '/checkout' },
            { title: 'Mis Pedidos', icon: <ClipboardList size={18} />, href: '/orders' }
        ]
    }
];

export default function FlowchartPage() {
    return (
        <div className="min-h-screen bg-background border-none">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-20 lg:px-12">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-5xl font-black font-serif tracking-tighter text-foreground mb-4">
                        Estructura del <span className="text-primary italic">Sistema</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">
                        Mapa Interactivo de Navegación
                    </p>
                </div>

                <div className="relative">
                    {/* Background Grid Accent */}
                    <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] -z-10" />

                    <div className="flex flex-col gap-12 max-w-4xl mx-auto">
                        {FLOW_NODES.map((section, sectionIdx) => (
                            <div key={section.id} className="relative animate-slide-in" style={{ animationDelay: `${sectionIdx * 100}ms` }}>
                                {/* Label for Section */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-[1px] flex-1 bg-border/40" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{section.title}</span>
                                    <div className="h-[1px] flex-1 bg-border/40" />
                                </div>

                                {section.type === 'entry' ? (
                                    <Link
                                        href={section.href || '/'}
                                        className="group block jhoanes-card bg-white/80 backdrop-blur-md p-6 hover:border-primary/50 transition-all text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {section.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{section.title}</h3>
                                                <p className="text-xs text-muted-foreground font-medium">{section.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {section.children?.map((child, childIdx) => (
                                            <Link
                                                key={child.title}
                                                href={child.href}
                                                className="group jhoanes-card bg-white/50 backdrop-blur-sm p-6 flex items-center justify-between border-transparent hover:border-primary/20 hover:bg-white transition-all shadow-sm hover:shadow-premium"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {child.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{child.title}</h4>
                                                        {child.note && <span className="text-[9px] text-accent font-black uppercase tracking-tighter italic">{child.note}</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={18} />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Line connector (except last) */}
                                {sectionIdx < FLOW_NODES.length - 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="h-6 w-[2px] bg-gradient-to-b from-primary/40 to-transparent" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend / Info */}
                <div className="mt-20 p-8 border border-border/40 rounded-[2rem] bg-secondary/20 max-w-2xl mx-auto text-center animate-fade-in delay-500">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                        "Haz clic en cualquiera de los bloques para navegar directamente a esa sección del sistema.
                        Este mapa representa el flujo de experiencia de usuario de Pedidos Jhoanes."
                    </p>
                </div>
            </main>
        </div>
    );
}
