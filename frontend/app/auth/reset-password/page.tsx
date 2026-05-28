'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isTokenValid, setIsTokenValid] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        // Extract token from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        
        if (!tokenParam) {
            setMessage({
                type: 'error',
                text: 'No se proporcionó un token de recuperación. Por favor, solicite un nuevo enlace de recuperación.'
            });
            setIsTokenValid(false);
            return;
        }
        
        setToken(tokenParam);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!newPassword || !confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Por favor, complete todos los campos.'
            });
            return;
        }
        
        if (newPassword.length < 6) {
            setMessage({
                type: 'error',
                text: 'La contraseña debe tener al menos 6 caracteres.'
            });
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Las contraseñas no coinciden.'
            });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const data = await api.post('/auth/reset-password', {
                token: token,
                newPassword: newPassword
            }) as any;
            
            setMessage({
                type: 'success',
                text: data.message || 'Contraseña restablecida exitosamente. Ahora puede iniciar sesión con su nueva contraseña.'
            });
            
            // Clear form
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 3000);
            
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Error al restablecer la contraseña. El token puede estar expirado o inválido.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTokenValid) {
        return (
            <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <div className="w-full max-w-md jhoanes-card bg-white/80 backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-[24px] mb-6 text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <h1 className="text-3xl font-black font-serif mb-3 tracking-tighter">Error</h1>
                        <p className="text-muted-foreground font-medium text-sm px-4">
                            {message.text}
                        </p>
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-border/40 text-center">
                        <Link 
                            href="/auth/forgot-password" 
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline transition-colors"
                        >
                            <ArrowLeft size={14} /> Solicitar nuevo enlace de recuperación
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-md jhoanes-card bg-white/80 backdrop-blur-xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-[24px] mb-6 text-primary">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-black font-serif mb-3 tracking-tighter">Restablecer Contraseña</h1>
                    <p className="text-muted-foreground font-medium text-sm px-4">
                        Ingrese su nueva contraseña a continuación
                    </p>
                </div>

                {message.text ? (
                    <div className={`p-6 rounded-[24px] text-center animate-fade-in ${
                        message.type === 'success' 
                        ? 'bg-green-50 border border-green-100 text-green-700' 
                        : 'bg-red-50 border border-red-100 text-red-700'
                    }`}>
                        {message.type === 'success' && <CheckCircle2 className="mx-auto mb-3 text-green-500" size={32} />}
                        <p className="text-sm font-bold leading-relaxed">{message.text}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 text-foreground/70">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="premium-input pl-12 h-14"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 text-foreground/70">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="premium-input pl-12 h-14"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full premium-button jhoanes-gradient text-white text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-3 shadow-lg"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Restablecer Contraseña'}
                        </button>
                    </form>
                )}

                <div className="mt-10 pt-8 border-t border-border/40 text-center">
                    <Link 
                        href="/auth/login" 
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} /> Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}