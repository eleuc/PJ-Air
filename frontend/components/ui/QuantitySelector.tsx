import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
    quantity: number | string;
    onIncrement: () => void;
    onDecrement: () => void;
    onManualChange?: (val: string) => void;
    variant?: 'card' | 'checkout';
}

export default function QuantitySelector({
    quantity,
    onIncrement,
    onDecrement,
    onManualChange,
    variant = 'card',
}: QuantitySelectorProps) {
    const isCheckout = variant === 'checkout';

    const containerClass = isCheckout
        ? "flex items-center gap-2 bg-white rounded-xl border border-border/60 p-1 shadow-sm"
        : "flex items-center justify-between w-full bg-muted/60 rounded-xl border border-border/30 overflow-hidden";

    const buttonClass = isCheckout
        ? "w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        : "px-2.5 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shrink-0";

    const inputOrSpanClass = isCheckout
        ? "text-xs font-black min-w-[1rem] text-center"
        : "w-0 min-w-0 flex-1 bg-transparent text-center text-sm font-bold outline-none text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-primary/5";

    const iconSize = isCheckout ? 12 : 13;

    return (
        <div className={containerClass}>
            <button 
                onClick={onDecrement} 
                className={buttonClass}
                type="button"
                aria-label="Disminuir cantidad"
            >
                <Minus size={iconSize} strokeWidth={2.5} />
            </button>
            
            {onManualChange && !isCheckout ? (
                <input
                    type="number"
                    min="1"
                    value={quantity || ''}
                    onChange={(e) => onManualChange(e.target.value)}
                    onFocus={(e) => {
                        if (quantity === 1 || quantity === '1') {
                            onManualChange('');
                        }
                        e.target.select();
                    }}
                    className={inputOrSpanClass}
                    title="Editar cantidad"
                />
            ) : (
                <span className={inputOrSpanClass}>
                    {quantity}
                </span>
            )}

            <button 
                onClick={onIncrement} 
                className={buttonClass}
                type="button"
                aria-label="Aumentar cantidad"
            >
                <Plus size={iconSize} strokeWidth={2.5} />
            </button>
        </div>
    );
}
