'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ForcePasswordChangeModal from '../auth/ForcePasswordChangeModal';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { requirePasswordChange } = useAuth();

    return (
        <>
            {children}
            {requirePasswordChange && <ForcePasswordChangeModal />}
        </>
    );
}
