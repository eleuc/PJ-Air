'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { api } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    updateLocalSession: (data: { user: User, session: Session, require_password_change?: boolean }) => void;
    requirePasswordChange: boolean;
    setRequirePasswordChange: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    signOut: async () => {},
    updateLocalSession: () => {},
    requirePasswordChange: false,
    setRequirePasswordChange: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);

    // Fetch full user profile including role from the backend
    const fetchUserProfile = async (userId: string, fallbackMeta?: any) => {
        try {
            const data = await api.get(`/users/${userId}`) as any;
            // Store full user data as 'profile' plus explicit role and offers
            setProfile({
                ...(fallbackMeta || {}),
                ...data?.profile,
                role: data?.role || fallbackMeta?.role || 'client',
                general_discount: data?.general_discount || 0,
                delivery_fee: data?.delivery_fee || 0,
                productDiscounts: data?.productDiscounts || [],
            });
        } catch {
            if (fallbackMeta) setProfile(fallbackMeta);
        }
    };

    useEffect(() => {
        const savedSession = localStorage.getItem('local_session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                setUser(parsed.user);
                setSession(parsed.session);
                setRequirePasswordChange(!!parsed.require_password_change);
                // Fetch live profile + role from backend
                fetchUserProfile(parsed.user.id, parsed.user?.user_metadata);
            } catch (e) {
                console.error('Error parsing local session:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const updateLocalSession = (data: { user: any, session: any, require_password_change?: boolean }) => {
        setUser(data.user);
        setSession(data.session);
        setRequirePasswordChange(!!data.require_password_change);
        localStorage.setItem('local_session', JSON.stringify(data));
        // Fetch live profile + role from backend immediately after login
        fetchUserProfile(data.user.id, data.user.user_metadata);
    };

    const signOut = async () => {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRequirePasswordChange(false);
        localStorage.removeItem('local_session');
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, isLoading, signOut, updateLocalSession, requirePasswordChange, setRequirePasswordChange }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
