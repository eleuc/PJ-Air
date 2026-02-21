'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Loader2, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate Login
        setTimeout(() => {
            setIsLoading(false);
            // As per wireframe: "Después de logueado va a Catálogo de producto"
            router.push('/catalog');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-xl jhoanes-card bg-white/80 backdrop-blur-xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-[24px] mb-6 text-primary">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-4xl font-black font-serif mb-3 tracking-tighter">Bienvenido de nuevo</h1>
                    <p className="text-muted-foreground font-medium">Delicias frescas te están esperando</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 text-foreground/70">Nombre de Usuario o Email</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="tu@correo.com o usuario"
                                className="premium-input pl-12 h-14"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-foreground/70">Contraseña</label>
                            <button type="button" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">¿Olvidaste tu contraseña?</button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="premium-input pl-12 h-14"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isLoading}
                            className="w-full premium-button jhoanes-gradient text-white text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Ingresar <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-border/40 text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                        ¿No tienes cuenta aún? <Link href="/auth/register" className="text-primary font-bold hover:underline ml-1">Regístrate ahora</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
