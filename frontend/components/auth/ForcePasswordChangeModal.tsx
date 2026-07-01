'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { KeyRound, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForcePasswordChangeModal() {
    const { setRequirePasswordChange } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!currentPassword) {
            setError('La contraseña actual es requerida.');
            return;
        }

        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }

        if (newPassword === currentPassword) {
            setError('La nueva contraseña debe ser diferente de la actual.');
            return;
        }

        setIsLoading(true);

        try {
            await api.patch('/admin-actions/me/change-password', {
                currentPassword,
                newPassword,
            });

            setSuccess(true);
            setTimeout(() => {
                setRequirePasswordChange(false);
                // Update local storage to clear require_password_change flag
                const savedSession = localStorage.getItem('local_session');
                if (savedSession) {
                    try {
                        const parsed = JSON.parse(savedSession);
                        parsed.require_password_change = false;
                        localStorage.setItem('local_session', JSON.stringify(parsed));
                    } catch (err) {
                        console.error(err);
                    }
                }
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al cambiar la contraseña. Verifica los datos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-border/20 overflow-hidden transform transition-all duration-300 scale-100">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-[20px] mb-4 text-primary">
                            <KeyRound size={32} />
                        </div>
                        <h2 className="text-2xl font-black font-serif tracking-tight text-foreground">
                            Cambio de contraseña obligatorio
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                            Por razones de seguridad, debes actualizar tu contraseña antes de continuar usando el sistema.
                        </p>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 text-green-600">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">¡Contraseña actualizada!</h3>
                            <p className="text-sm text-muted-foreground mt-1">Accediendo al sistema...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-[12px] text-sm font-medium">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/10 border border-border/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-[12px] outline-none text-foreground text-sm font-medium transition-all"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Nueva Contraseña (mín. 8 caracteres)
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/10 border border-border/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-[12px] outline-none text-foreground text-sm font-medium transition-all"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Confirmar Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/10 border border-border/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-[12px] outline-none text-foreground text-sm font-medium transition-all"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-[12px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6 shadow-lg shadow-primary/20 cursor-pointer"
                            >
                                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
