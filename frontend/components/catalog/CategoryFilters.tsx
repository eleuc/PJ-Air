'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface CategoryFiltersProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const CategoryFilters = ({ categories, activeCategory, onCategoryChange, searchQuery, onSearchChange }: CategoryFiltersProps) => {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Category pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] shadow-premium border border-border/40 flex-1">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeCategory === cat ? 'bg-primary text-white shadow-2xl scale-105' : 'text-muted-foreground hover:bg-white hover:text-foreground hover:shadow-lg'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search box */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full sm:w-56 pl-11 pr-4 py-4 rounded-[2rem] bg-white/50 backdrop-blur-md border border-border/40 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm placeholder:text-muted-foreground/60"
                />
            </div>
        </div>
    );
};
