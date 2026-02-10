'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, setMonth, setYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
    onChange: (dates: { startDate: string; endDate: string }) => void;
    currentDate?: Date;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ onChange, currentDate = new Date() }) => {
    const [date, setDate] = React.useState(currentDate);

    const handlePrevMonth = () => {
        const newDate = new Date(date.setMonth(date.getMonth() - 1));
        updateDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(date.setMonth(date.getMonth() + 1));
        updateDate(newDate);
    };

    const updateDate = (newDate: Date) => {
        const freshDate = new Date(newDate);
        setDate(freshDate);
        const start = format(startOfMonth(freshDate), 'yyyy-MM-dd');
        const end = format(endOfMonth(freshDate), 'yyyy-MM-dd');
        onChange({ startDate: start, endDate: end });
    };

    // Initial trigger
    React.useEffect(() => {
        const start = format(startOfMonth(date), 'yyyy-MM-dd');
        const end = format(endOfMonth(date), 'yyyy-MM-dd');
        onChange({ startDate: start, endDate: end });
    }, []);

    return (
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl px-2 py-1.5 shadow-sm">
            <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors"
                title="Mes anterior"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
                <Calendar size={14} className="text-primary/60" />
                <span className="text-sm font-bold text-gray-700 capitalize">
                    {format(date, 'MMMM yyyy', { locale: es })}
                </span>
            </div>

            <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors"
                title="Mes siguiente"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};
