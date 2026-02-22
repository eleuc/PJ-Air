'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

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

    useEffect(() => {
        // Load local session from localStorage
        const savedSession = localStorage.getItem('local_session');
        if (savedSession) {
            try {
                const { user, session } = JSON.parse(savedSession);
                setUser(user);
                setSession(session);
                // Restore profile from user_metadata (includes role)
                if (user?.user_metadata) {
                    setProfile(user.user_metadata);
                }
            } catch (e) {
                console.error('Error parsing local session:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const updateLocalSession = (data: { user: any, session: any }) => {
        setUser(data.user);
        setSession(data.session);
        setProfile(data.user.user_metadata);
        localStorage.setItem('local_session', JSON.stringify(data));
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
