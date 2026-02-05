'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    id: string;
    label: string;
}

interface SegmentedControlProps {
    label: string;
    icon?: LucideIcon;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    className
}) => {
    return (
        <div className={cn("flex flex-col gap-3 w-full px-6 py-4 rounded-2xl border bg-gray-50 border-gray-100 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:bg-white", className)}>
            <div className="flex items-center gap-3">
                {Icon && <Icon size={16} className="text-gray-400" />}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    {label}
                </span>
            </div>

            <div className="flex p-1 bg-gray-100/50 rounded-xl gap-1">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200",
                            value === option.id
                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
