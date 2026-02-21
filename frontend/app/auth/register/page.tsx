'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, Phone } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // As per wireframe: "Cuando crea la cuenta es enviado a Agregar Nueva Dirección"
            router.push('/profile/addresses/new');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-2xl jhoanes-card bg-white/80 backdrop-blur-xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-[24px] mb-6 text-primary">
                        <User size={32} />
                    </div>
                    <h1 className="text-4xl font-black font-serif mb-3 tracking-tighter">Únete a Jhoanes</h1>
                    <p className="text-muted-foreground font-medium">Crea tu cuenta para gestionar tus pedidos personalizados</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-fade-in text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    className="premium-input pl-12"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre de Usuario</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-[10px] font-bold">@</div>
                                <input
                                    required
                                    type="text"
                                    placeholder="usuario123"
                                    className="premium-input pl-12"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    className="premium-input pl-12"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="tel"
                                    placeholder="Ej: +51 987 654 321"
                                    className="premium-input pl-12"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 invisible md:visible">
                            {/* Spacer for grid alignment */}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="premium-input pl-12"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="premium-input pl-12"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isLoading}
                            className="w-full premium-button jhoanes-gradient text-white text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Crear mi cuenta <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-border/40 text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                        ¿Ya eres parte de Jhoanes? <Link href="/auth/login" className="text-primary font-bold hover:underline ml-1">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
