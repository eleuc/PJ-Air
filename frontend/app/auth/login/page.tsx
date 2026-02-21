'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
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

                <LoginForm 
                    identifier={identifier}
                    setIdentifier={setIdentifier}
                    password={password}
                    setPassword={setPassword}
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                />

                <div className="mt-12 pt-8 border-t border-border/40 text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                        ¿No tienes cuenta aún? <Link href="/auth/register" className="text-primary font-bold hover:underline ml-1">Regístrate ahora</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
