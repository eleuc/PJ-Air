'use client';

import React from 'react';
import { Star } from 'lucide-react';

export const CatalogHeader = () => {
    return (
        <header className="mb-8 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-4 px-4">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                        <Star size={14} fill="currentColor" /> Panadería & Repostería Jhoanes
                    </div>
                </div>
            </div>
        </header>
    );
};
