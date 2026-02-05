'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CustomToggleProps {
    label: string;
    icon?: LucideIcon;
    value: boolean;
    onChange: (value: boolean) => void;
    className?: string;
    activeColor?: string;
    inactiveColor?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
    label,
    icon: Icon,
    value,
    onChange,
    className,
    activeColor = "bg-[#AFF0BA]",
    inactiveColor = "bg-[#FF7A7A]"
}) => {
    return (
        <div className={cn("group flex items-center justify-between gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 border bg-gray-50 border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-md hover:bg-white", className)}>
            <div className="flex items-center gap-3 overflow-hidden">
                {Icon && <Icon size={16} className={cn("shrink-0", value ? "text-primary" : "text-gray-400")} />}
                <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-bold tracking-tight truncate text-gray-900">
                        {label}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onChange(!value)}
                className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    value ? activeColor : inactiveColor
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        value ? "translate-x-6" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
};
