'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { session, profile, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!session) {
            // No session — token was either never present or cleared by fetchUserProfile
            // due to a 401 (invalid/expired token). Redirect to login.
            router.push('/auth/login');
        }
    }, [isLoading, session, router]);

    useEffect(() => {
        if (isLoading || !session) return;

        // Check admin role once profile is available
        if (profile && profile.role !== 'admin') {
            // User is authenticated but not an admin — redirect to home
            router.push('/');
        }
    }, [isLoading, session, profile, router]);

    // Show loading while auth state is resolving
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-primary/40" />
                    <p className="text-sm font-semibold text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Session cleared (401 from profile fetch) — redirect is in flight
    if (!session) return null;

    // Profile still loading or failed without clearing session (network error) —
    // render anyway; the sidebar and pages can operate with the cached user data
    if (!profile) return <>{children}</>;

    // Non-admin role — redirect is in flight
    if (profile.role !== 'admin') return null;

    return <>{children}</>;
}
