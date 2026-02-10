'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';

interface DateRangePickerProps {
    onChange: (dates: { startDate: string; endDate: string }) => void;
    initialStartDate?: string;
    initialEndDate?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange, initialStartDate, initialEndDate }) => {
    // Default to current month if no initial dates
    const now = new Date();
    const defaultStart = initialStartDate || format(startOfMonth(now), 'yyyy-MM-dd');
    const defaultEnd = initialEndDate || format(endOfMonth(now), 'yyyy-MM-dd');

    const [startDate, setStartDate] = React.useState(defaultStart);
    const [endDate, setEndDate] = React.useState(defaultEnd);

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStartDate(val);
        onChange({ startDate: val, endDate });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEndDate(val);
        onChange({ startDate, endDate: val });
    };

    // Initial trigger
    React.useEffect(() => {
        onChange({ startDate, endDate });
    }, []);

    return (
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-primary/60" />
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartChange}
                    className="text-[12px] font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer w-[95px]"
                />
            </div>

            <ArrowRight size={12} className="text-gray-300" />

            <div className="flex items-center gap-1.5">
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndChange}
                    className="text-[12px] font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer w-[95px]"
                />
            </div>
        </div>
    );
};
