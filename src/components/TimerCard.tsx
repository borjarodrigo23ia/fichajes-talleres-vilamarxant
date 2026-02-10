'use client';

import React, { useEffect, useState } from 'react';
import { WorkCycle, FichajeState } from '@/lib/types';

import { parseDolibarrDate } from '@/lib/date-utils';

interface TimerCardProps {
    cycle: WorkCycle | null;
    currentState: FichajeState;
    onEntrar: () => void;
    onSalir: () => void;
    onPausa: () => void;
    loading?: boolean;
    isInitialLoad?: boolean;
    isOnline?: boolean;
    offlineQueueCount?: number;
}

export const TimerCard: React.FC<TimerCardProps> = ({
    cycle,
    currentState,
    onEntrar,
    onSalir,
    onPausa,
    loading,
    isInitialLoad = false,
    isOnline = true,
    offlineQueueCount = 0
}) => {
    const [currentTime, setCurrentTime] = useState<string>('');

    const triggerVibration = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(100);
        }
    };

    const handleAction = (callback: () => void) => {
        triggerVibration();
        callback();
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000); // Update every second to catch minute changes precisely
        return () => clearInterval(interval);
    }, []);

    const getStartTime = () => {
        if (!cycle?.entrada?.fecha_creacion) return '--:--';
        // Use parseDolibarrDate to treat the string as Local Time (backend is Europe/Madrid)
        const date = parseDolibarrDate(cycle.entrada.fecha_creacion);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const getPausaStartTime = () => {
        if (currentState !== 'en_pausa') return null;
        const lastPausa = cycle?.pausas[cycle.pausas.length - 1];
        if (!lastPausa?.inicio?.fecha_creacion) return null;

        // Use parseDolibarrDate to treat the string as Local Time
        const date = parseDolibarrDate(lastPausa.inicio.fecha_creacion);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const startTime = getStartTime();
    const pausaTime = getPausaStartTime();

    const getStatusConfig = () => {
        switch (currentState) {
            case 'sin_iniciar':
                return {
                    text: 'Sin iniciar',
                    subtext: 'Listo para comenzar',
                    color: 'gray'
                };
            case 'trabajando':
                return {
                    text: 'Trabajando',
                    subtext: `Trabajando desde las ${startTime}`,
                    color: 'emerald'
                };
            case 'en_pausa':
                return {
                    text: 'En pausa',
                    subtext: `En pausa desde las ${pausaTime}`,
                    color: 'amber'
                };
            case 'finalizado':
                return {
                    text: 'Jornada finalizada',
                    subtext: 'Hasta mañana',
                    color: 'blue'
                };
            default: return { text: '', subtext: '', color: 'gray' };
        }
    };

    const status = getStatusConfig();
    const displayTime = currentState === 'sin_iniciar' ? currentTime : (
        currentState === 'en_pausa' ? pausaTime : startTime
    );

    const AnimatedDigit = ({ char }: { char: string }) => (
        <span className="inline-block relative overflow-hidden h-[1.2em] w-[0.6em] text-center -mx-[0.02em]">
            <span key={char} className="block animate-slide-up absolute inset-0">
                {char}
            </span>
            {/* Invis placeholder to keep width */}
            <span className="invisible">{char}</span>
        </span>
    );

    return (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
            {/* Status Indicator / Header */}
            <div className="flex flex-col items-center justify-center mb-6 md:mb-10">
                <div className={`
                    inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4
                    ${currentState === 'trabajando' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${currentState === 'en_pausa' ? 'bg-amber-100 text-amber-800' : ''}
                    ${currentState === 'sin_iniciar' ? 'bg-gray-100 text-gray-600' : ''}
                `}>
                    <span className={`w-2 h-2 rounded-full ${currentState === 'trabajando' ? 'bg-emerald-500 animate-pulse' :
                        currentState === 'en_pausa' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                    {status.text}
                </div>

                {/* Offline & Queue Badges */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {!isOnline && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider animate-pulse border border-red-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a5 5 0 01-7.072 0m0 0L4 15.536m2.121-12.728a9 9 0 0112.728 0m0 0L17 5.636" /></svg>
                            Modo Offline
                        </div>
                    )}
                    {offlineQueueCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider border border-amber-200 shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {offlineQueueCount} pend. de sincronizar
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter mb-2 font-mono flex justify-center">
                        {displayTime?.split('').map((char, i) => (
                            <AnimatedDigit key={i} char={char} />
                        )) || '--:--'}
                    </h2>
                    <p className="text-gray-500 font-medium text-base md:text-lg">
                        {status.subtext}
                    </p>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-rows-1 gap-3 md:gap-4">
                {/* Loading Skeleton during initial load */}
                {isInitialLoad && (
                    <div className="animate-pulse">
                        <div className="w-full h-16 md:h-20 bg-gray-200 rounded-2xl"></div>
                    </div>
                )}

                {!isInitialLoad && currentState === 'sin_iniciar' && (
                    <button
                        onClick={() => handleAction(onEntrar)}
                        disabled={loading}
                        className="group relative w-full py-5 md:py-6 rounded-2xl bg-[#AFF0BA] text-slate-800 font-bold text-lg md:text-xl shadow-[0_0_20px_rgba(175,240,186,0.4)] hover:shadow-[0_0_30px_rgba(175,240,186,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out touch-manipulation overflow-hidden will-change-transform"
                    >
                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        Entrar
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 pointer-events-none">
                            <div className="w-full h-full bg-white blur-xl" />
                        </div>
                    </button>
                )}

                {!isInitialLoad && currentState === 'trabajando' && (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button
                            onClick={() => handleAction(onPausa)}
                            disabled={loading}
                            className="group relative py-5 md:py-6 rounded-2xl bg-[#FFEEA3] text-slate-800 font-bold text-base md:text-lg shadow-[0_0_20px_rgba(255,238,163,0.4)] hover:shadow-[0_0_30px_rgba(255,238,163,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation overflow-hidden will-change-transform"
                        >
                            Pausar
                        </button>
                        <button
                            onClick={() => handleAction(onSalir)}
                            disabled={loading}
                            className="group relative py-5 md:py-6 rounded-2xl bg-[#FF7A7A] text-white font-bold text-base md:text-lg shadow-[0_0_20px_rgba(255,122,122,0.4)] hover:shadow-[0_0_30px_rgba(255,122,122,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation overflow-hidden will-change-transform"
                        >
                            Salir
                        </button>
                    </div>
                )}

                {!isInitialLoad && currentState === 'en_pausa' && (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button
                            onClick={() => handleAction(onPausa)} // This toggles back to resume in parent logic
                            disabled={loading}
                            className="group relative py-5 md:py-6 rounded-2xl bg-[#ACE4F2] text-slate-800 font-bold text-base md:text-lg shadow-[0_0_20px_rgba(172,228,242,0.4)] hover:shadow-[0_0_30px_rgba(172,228,242,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation overflow-hidden will-change-transform"
                        >
                            Reanudar
                        </button>
                        <button
                            onClick={() => handleAction(onSalir)}
                            disabled={loading}
                            className="group relative py-5 md:py-6 rounded-2xl bg-[#FF7A7A] text-white font-bold text-base md:text-lg shadow-[0_0_20px_rgba(255,122,122,0.4)] hover:shadow-[0_0_30px_rgba(255,122,122,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 touch-manipulation overflow-hidden will-change-transform"
                        >
                            Salir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
