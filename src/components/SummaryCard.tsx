'use client';

import React from 'react';

export const SummaryCard = () => {
    // Mock Data as per design
    const data = [
        { day: 'Lun', val: 60, active: false },
        { day: 'Mar', val: 40, active: false },
        { day: 'Mie', val: 80, active: false },
        { day: 'Jue', val: 100, active: true },
        { day: 'Vie', val: 50, active: false },
        { day: 'Sab', val: 45, active: false },
    ];

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 flex flex-col md:flex-row gap-6 md:gap-8 h-full">
            <div className="flex-1 space-y-4 md:space-y-6">
                <h3 className="text-gray-900 font-medium text-base md:text-lg">Resumen</h3>

                <div className="space-y-3 md:space-y-4">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-[#00D16B]">15</span>
                            <span className="text-gray-400 text-sm">Trabajando</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-[#FFB547]">5</span>
                            <span className="text-gray-400 text-sm">Descanso</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-[#121726]">20</span>
                            <span className="text-gray-400 text-sm">Total plantilla</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="mb-3 md:mb-4 text-right">
                    <span className="text-3xl md:text-4xl font-bold text-[#121726] block">45</span>
                    <span className="text-gray-400 text-sm">Fichajes hoy</span>
                </div>

                <div className="flex-1 flex items-end justify-between gap-3 md:gap-4 mt-3 md:mt-4 h-24 md:h-32">
                    {data.map((d) => (
                        <div key={d.day} className="flex flex-col items-center gap-2 group w-full">
                            <div
                                className={`w-3 rounded-full transition-all duration-500 ease-out hover:w-4 ${d.active ? 'bg-[#121726]' : 'bg-[#1565D8]'}`}
                                style={{ height: `${d.val}%` }}
                            ></div>
                            <span className={`text-xs ${d.active ? 'bg-gray-100 rounded px-1.5 py-0.5 font-bold text-gray-900' : 'text-gray-400'}`}>
                                {d.day}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
