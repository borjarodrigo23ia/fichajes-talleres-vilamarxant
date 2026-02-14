'use client';

import React from 'react';
import { WorkCycle } from '@/lib/types';
import { format } from 'date-fns';
import { parseDolibarrDate } from '@/lib/date-utils';

interface LastFichajeCardProps {
    cycle: WorkCycle | null;
}

export const LastFichajeCard: React.FC<LastFichajeCardProps> = ({ cycle }) => {
    const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        const date = parseDolibarrDate(isoString);
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const calculateDuration = () => {
        if (!cycle?.entrada || !cycle.salida) return '0h';
        // Use pre-calculated duration from backend/hook if avail, else diff
        if (cycle.duracion_efectiva) {
            const h = Math.floor(cycle.duracion_efectiva / 60);
            return `${h}h`; // Simplificado como en diseño
        }
        return '0h';
    };

    // Si hay ciclo activo, mostramos los datos de ESE ciclo (Entrada, Salida pendiente, trabajado so far)
    // O mostramos el "Último fichaje CERRADO"?
    // El diseño dice "Último fichaje". Si estoy trabajando, mi ultimo fichaje es el actual.

    const entrada = formatTime(cycle?.entrada?.fecha_creacion);
    const salida = cycle?.salida ? formatTime(cycle.salida.fecha_creacion) : '--:--';

    // Calculo trabajado tiempo real si activo? o solo si cerrado.
    // Diseño muestra "8h", sugiere jornada completa.
    // Pondremos duración parcial si activo.

    const trabajado = cycle?.duracion_efectiva
        ? `${Math.floor(cycle.duracion_efectiva / 60)}h ${cycle.duracion_efectiva % 60}m`
        : '0h';

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 h-full min-h-[200px] fix-safari-blur">
            <h3 className="text-gray-900 font-medium mb-4 md:mb-6 text-base md:text-lg">Último fichaje</h3>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden md:flex justify-between items-center text-center divide-x divide-gray-100">
                <div className="flex-1 px-2">
                    <span className="text-xs text-gray-400 block mb-1">Entrada</span>
                    <span className="text-2xl font-bold text-gray-900">{entrada} <span className="text-sm font-normal text-gray-400">h</span></span>
                    <div className="text-[10px] text-red-500 font-mono">{cycle?.entrada?.fecha_creacion}</div>
                </div>
                <div className="flex-1 px-2">
                    <span className="text-xs text-gray-400 block mb-1">Salida</span>
                    <span className="text-2xl font-bold text-gray-900">{salida} <span className="text-sm font-normal text-gray-400">h</span></span>
                </div>
                <div className="flex-1 px-2">
                    <span className="text-xs text-gray-400 block mb-1">Trabajado</span>
                    <span className="text-2xl font-bold text-gray-900">{trabajado}</span>
                </div>
                <div className="flex-1 px-2">
                    <span className="text-xs text-gray-400 block mb-1">Restante</span>
                    <span className="text-2xl font-bold text-gray-900">0h</span>
                </div>
            </div>

            {/* Mobile: 2x2 Grid */}
            <div className="md:hidden grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400 block mb-1">Entrada</span>
                    <span className="text-xl font-bold text-gray-900">{entrada} <span className="text-xs font-normal text-gray-400">h</span></span>
                    <div className="text-[10px] text-red-500 font-mono">{cycle?.entrada?.fecha_creacion}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400 block mb-1">Salida</span>
                    <span className="text-xl font-bold text-gray-900">{salida} <span className="text-xs font-normal text-gray-400">h</span></span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400 block mb-1">Trabajado</span>
                    <span className="text-xl font-bold text-gray-900">{trabajado}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-400 block mb-1">Restante</span>
                    <span className="text-xl font-bold text-gray-900">0h</span>
                </div>
            </div>
        </div>
    );
};
