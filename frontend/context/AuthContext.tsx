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
    updateLocalSession: (data: { user: User, session: Session }) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    signOut: async () => {},
    updateLocalSession: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch full user profile including role from the backend
    const fetchUserProfile = async (userId: string, fallbackMeta?: any) => {
        try {
            const data = await api.get(`/users/${userId}`);
            // Merge user_metadata with real backend data (role comes from backend)
            setProfile({
                ...(fallbackMeta || {}),
                ...data?.profile,
                role: data?.role || fallbackMeta?.role || 'client',
            });
        } catch {
            // If backend call fails, fall back to metadata
            if (fallbackMeta) setProfile(fallbackMeta);
        }
    };

    useEffect(() => {
        const savedSession = localStorage.getItem('local_session');
        if (savedSession) {
            try {
                const { user, session } = JSON.parse(savedSession);
                setUser(user);
                setSession(session);
                // Fetch live profile + role from backend
                fetchUserProfile(user.id, user?.user_metadata);
            } catch (e) {
                console.error('Error parsing local session:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const updateLocalSession = (data: { user: any, session: any }) => {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('local_session', JSON.stringify(data));
        // Fetch live profile + role from backend immediately after login
        fetchUserProfile(data.user.id, data.user.user_metadata);
    };

    const signOut = async () => {
        setUser(null);
        setSession(null);
        setProfile(null);
        localStorage.removeItem('local_session');
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, isLoading, signOut, updateLocalSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
