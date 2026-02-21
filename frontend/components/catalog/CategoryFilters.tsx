'use client';

import React from 'react';

interface CategoryFiltersProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryFilters = ({ categories, activeCategory, onCategoryChange }: CategoryFiltersProps) => {
    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-3 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] shadow-premium border border-border/40">
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
    );
};
