import React, { useEffect, useState } from 'react';
import { WorkCycle } from '@/lib/types';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Coffee, Timer, Play, Pause } from 'lucide-react';

interface ActiveWorkCycleCardProps {
    cycle: WorkCycle | null;
    user?: {
        firstname?: string;
        username?: string;
        login?: string;
    } | null;
}

export const ActiveWorkCycleCard: React.FC<ActiveWorkCycleCardProps> = ({ cycle, user }) => {
    const [timeWorked, setTimeWorked] = useState<number>(0);
    const [pauseTime, setPauseTime] = useState<number>(0);

    useEffect(() => {
        if (!cycle?.entrada) return;

        // Asegurar format ISO 
        const entryDateStr = cycle.entrada.fecha_creacion.endsWith('Z') ? cycle.entrada.fecha_creacion : `${cycle.entrada.fecha_creacion}Z`;
        const startTime = parseISO(entryDateStr);

        const compute = (now: Date) => {
            // Calcular tiempo total de pausas
            let totalPauseTime = 0;
            let paused = false;

            cycle.pausas.forEach((pausa) => {
                if (pausa.inicio && pausa.fin) {
                    const finStr = pausa.fin.fecha_creacion.endsWith('Z') ? pausa.fin.fecha_creacion : `${pausa.fin.fecha_creacion}Z`;
                    const inicioStr = pausa.inicio.fecha_creacion.endsWith('Z') ? pausa.inicio.fecha_creacion : `${pausa.inicio.fecha_creacion}Z`;
                    totalPauseTime += differenceInSeconds(
                        parseISO(finStr),
                        parseISO(inicioStr)
                    );
                } else if (pausa.inicio && !pausa.fin) {
                    paused = true;
                    const inicioStr = pausa.inicio.fecha_creacion.endsWith('Z') ? pausa.inicio.fecha_creacion : `${pausa.inicio.fecha_creacion}Z`;
                    // Acumular hasta el momento actual para congelar trabajado en la frontera
                    totalPauseTime += differenceInSeconds(now, parseISO(inicioStr));
                }
            });

            const totalTimeInSeconds = differenceInSeconds(now, startTime);
            const worked = totalTimeInSeconds - totalPauseTime;

            setPauseTime(totalPauseTime);
            setTimeWorked(worked);
            return paused;
        };

        // Primera evaluación inmediata
        const now = new Date();
        const isPaused = compute(now);

        // Si está en pausa, no mantener intervalos: congelar contadores
        if (isPaused) {
            return;
        }

        // Actualizar cada segundo solo si NO está en pausa
        const interval = setInterval(() => compute(new Date()), 1000);
        return () => clearInterval(interval);
    }, [cycle]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
        parts.push(`${secs}s`);

        return parts.join(' ');
    };

    const formatFecha = (fecha: string) => {
        try {
            const dateStr = fecha.endsWith('Z') ? fecha : `${fecha}Z`;
            return format(parseISO(dateStr), "HH:mm", { locale: es });
        } catch (error) {
            return '--:--';
        }
    };

    const isCurrentlyPaused = cycle?.pausas && cycle.pausas.length > 0 &&
        cycle.pausas[cycle.pausas.length - 1] && !cycle.pausas[cycle.pausas.length - 1].fin;

    if (!cycle?.entrada) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Estado del trabajo</h3>
                        <p className="text-sm text-gray-500">No hay ningún ciclo de trabajo activo</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-100 p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
            {/* Versión Desktop - Layout horizontal minimalista */}
            <div className="hidden md:grid md:grid-cols-4 items-center gap-8">
                {/* Columna 1: Avatar del usuario */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                            {(user?.firstname || user?.username || user?.login || 'T')?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Usuario</p>
                        <p className="text-xs text-gray-500">{user?.firstname || user?.username || user?.login || 'Empleado'}</p>
                    </div>
                </div>

                {/* Columna 2: Estado del trabajo */}
                <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isCurrentlyPaused
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isCurrentlyPaused ? 'bg-orange-500' : 'bg-green-500'
                            }`}></div>
                        <span>{isCurrentlyPaused ? 'En pausa' : 'Trabajando'}</span>
                    </div>
                    {isCurrentlyPaused && (
                        <div className="text-xs text-gray-400">
                            Desde las {formatFecha(cycle.entrada.fecha_creacion)}
                        </div>
                    )}
                </div>

                {/* Columna 3: Contador Trabajado */}
                <div className="text-left">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Timer className="w-3 h-3" />
                        <span>Trabajado</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                        {formatTime(timeWorked)}
                    </div>
                </div>

                {/* Columna 4: Contador Pausas */}
                <div className="text-left">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Pause className="w-3 h-3" />
                        <span>Pausas</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                        {formatTime(pauseTime)}
                    </div>
                </div>
            </div>

            {/* Indicador de pausa activa - Desktop minimalista */}
            {isCurrentlyPaused && (
                <div className="hidden md:block mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-orange-600">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-medium">Pausa en curso</span>
                    </div>
                </div>
            )}

            {/* Versión Móvil */}
            <div className="md:hidden">
                {/* Header centrado solo con estado */}
                <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCurrentlyPaused ? 'bg-amber-100' : 'bg-green-100'
                            }`}>
                            {isCurrentlyPaused ? (
                                <Pause className="h-4 w-4 text-amber-600" />
                            ) : (
                                <Play className="h-4 w-4 text-green-600" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {isCurrentlyPaused ? 'En pausa' : 'Trabajando'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Desde las {formatFecha(cycle.entrada.fecha_creacion)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contadores en grid 2x1 */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Tiempo trabajado */}
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Timer className="h-3 w-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600">Trabajado</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            {formatTime(timeWorked)}
                        </p>
                    </div>

                    {/* Tiempo en pausas */}
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Coffee className="h-3 w-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600">Pausas</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            {formatTime(pauseTime)}
                        </p>
                    </div>
                </div>

                {/* Indicador de pausa activa - móvil */}
                {isCurrentlyPaused && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-amber-600">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Pausa en curso</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
