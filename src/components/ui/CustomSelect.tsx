'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    id: string;
    label: string;
}

interface CustomSelectProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    icon?: LucideIcon;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    options,
    value,
    onChange,
    className,
    icon: Icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className={cn("relative inline-block w-full", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex items-center justify-between gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 border focus:outline-none focus:ring-4 focus:ring-primary/10",
                    isOpen
                        ? "bg-white text-[#121726] border-primary shadow-lg ring-2 ring-primary/5"
                        : "bg-gray-50 text-gray-700 border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-md hover:bg-white active:scale-[0.98]"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon size={16} className={cn("shrink-0", isOpen ? "text-primary" : "text-gray-400")} />}
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {label}
                        </span>
                        <span className="text-sm font-bold tracking-tight truncate">
                            {selectedOption ? selectedOption.label : 'Seleccionar...'}
                        </span>
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-300",
                        isOpen ? "rotate-180 opacity-100 text-primary" : "opacity-40 group-hover:opacity-100"
                    )}
                />
            </button>

            {/* Dropdown menu */}
            <div
                className={cn(
                    "absolute left-0 right-0 z-[100] mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-2 transition-all duration-300 origin-top overflow-hidden",
                    isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                )}
            >
                <ul className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {options.map((option) => (
                        <li key={option.id}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                                    value === option.id
                                        ? "bg-primary/5 text-primary border-primary/10 border"
                                        : "hover:bg-gray-50 text-gray-600 border border-transparent"
                                )}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span className={cn(
                                    "text-sm tracking-tight transition-all",
                                    value === option.id ? "font-bold" : "font-medium"
                                )}>
                                    {option.label}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
