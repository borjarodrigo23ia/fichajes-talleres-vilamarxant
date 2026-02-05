import React, { useMemo, useState, useEffect } from 'react';
import { WorkCycle } from '@/lib/types';
import { DayHistoryCard } from './DayHistoryCard';
import { ChevronDown, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

import { TimelineEvent } from '@/lib/fichajes-utils';

interface HistoryListProps {
    cycles: WorkCycle[];
    loading?: boolean;
    title?: string;
    showUserName?: boolean;
    isGlobal?: boolean;
    onEdit?: (event: TimelineEvent) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ cycles, loading, title = 'Historial de Jornadas', showUserName = false, isGlobal = false, onEdit }) => {
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    const currentMonthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    // Group cycles by Month and then by Day
    const monthlyGroups = useMemo(() => {
        const groups: Record<string, Record<string, WorkCycle[]>> = {};

        cycles.forEach(cycle => {
            if (!cycle.fecha) return;

            // STRICT GROUPING: Use string manipulation to avoid timezone shifts.
            // Assuming cycle.fecha is "YYYY-MM-DD..." or similar ISO-like structure.
            // We want the local representation as stored in the DB.
            const dateKey = cycle.fecha.substring(0, 10); // "2024-01-25"

            // Basic validation
            if (dateKey.length < 10) return;

            const monthKey = dateKey.substring(0, 7); // "2024-01"

            if (!groups[monthKey]) groups[monthKey] = {};
            if (!groups[monthKey][dateKey]) groups[monthKey][dateKey] = [];

            groups[monthKey][dateKey].push(cycle);
        });

        // Convert to sorted array structure
        const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a));

        return sortedMonths.map(monthKey => {
            const daysInMonth = groups[monthKey];
            const sortedDays = Object.keys(daysInMonth).sort((a, b) => b.localeCompare(a)).map(dateKey => ({
                dateKey,
                cycles: daysInMonth[dateKey]
            }));
            return { monthKey, days: sortedDays };
        });
    }, [cycles]);

    // Initialize expansion state
    useEffect(() => {
        if (monthlyGroups.length > 0 && Object.keys(expandedMonths).length === 0) {
            const initial: Record<string, boolean> = {};
            monthlyGroups.forEach(({ monthKey }) => {
                // Auto-expand ALL months by default for better UX with pagination
                initial[monthKey] = true;
            });
            setExpandedMonths(initial);
        }
    }, [monthlyGroups, currentMonthKey]);

    const toggleMonth = (monthKey: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthKey]: !prev[monthKey]
        }));
    };

    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Cargando historial...</div>;
    }

    if (!cycles || cycles.length === 0) {
        return <div className="p-8 text-center text-gray-400">No hay historial disponible</div>;
    }

    return (
        <div className="w-full max-w-md mx-auto md:max-w-none space-y-8">
            {monthlyGroups.map(({ monthKey, days }) => {
                const isExpanded = expandedMonths[monthKey] ?? false;
                const isCurrentMonth = monthKey === currentMonthKey;

                if (isCurrentMonth) {
                    return (
                        <div key={monthKey} className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3 px-2">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                    Este Mes ({formatMonth(monthKey)})
                                </span>
                                <div className="h-px flex-1 bg-primary/10"></div>
                            </div>
                            <div className="space-y-4">
                                {days.map(({ dateKey, cycles: dayCycles }) => (
                                    <DayHistoryCard
                                        key={dateKey}
                                        date={dateKey}
                                        cycles={dayCycles}
                                        isGlobal={isGlobal}
                                        onEdit={onEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={monthKey} className="group flex flex-col gap-3">
                        {/* Monthly Collapsible Header */}
                        <button
                            onClick={() => toggleMonth(monthKey)}
                            className={cn(
                                "flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all duration-300",
                                "bg-white border border-gray-100 shadow-sm hover:shadow-md",
                                isExpanded ? "border-primary/20" : "hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center rounded-xl transition-colors font-bold text-xs tracking-wider",
                                    "bg-gray-100 text-gray-700"
                                )}>
                                    {formatMonth(monthKey).substring(0, 3).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-sm font-bold transition-colors",
                                        isExpanded ? "text-primary" : "text-gray-900"
                                    )}>
                                        {formatMonth(monthKey)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        {days.length} {days.length === 1 ? 'Día' : 'Días'} con registros
                                    </span>
                                </div>
                            </div>

                            <div className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                isExpanded ? "rotate-180 bg-primary/10 text-primary" : "bg-gray-50 text-gray-300"
                            )}>
                                <ChevronDown size={18} />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="flex flex-col gap-4 pl-4 md:pl-6 border-l-2 border-primary/10 ml-6 md:ml-8 py-2 animate-slide-up">
                                {days.map(({ dateKey, cycles: dayCycles }) => (
                                    <DayHistoryCard
                                        key={dateKey}
                                        date={dateKey}
                                        cycles={dayCycles}
                                        isGlobal={isGlobal}
                                        onEdit={onEdit}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
