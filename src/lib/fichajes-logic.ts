import { Fichaje, WorkCycle, FichajeTipo } from './types';
import { differenceInMinutes } from 'date-fns';
import { parseDolibarrDate } from './date-utils';

export const groupFichajesIntoCycles = (fichajesArray: Fichaje[]): WorkCycle[] => {
    if (!Array.isArray(fichajesArray) || fichajesArray.length === 0) {
        return [];
    }

    // --- SOLUCIÓN: Agrupar por usuario primero para soportar Historial Global ---
    const fichajesByUser: Record<string, Fichaje[]> = {};
    fichajesArray.forEach(f => {
        const key = f.fk_user || f.usuario || 'unknown';
        if (!fichajesByUser[key]) fichajesByUser[key] = [];
        fichajesByUser[key].push(f);
    });

    let allCycles: WorkCycle[] = [];

    // Procesar cada usuario de forma independiente
    Object.values(fichajesByUser).forEach(userFichajes => {
        const sortedFichajes = [...userFichajes].sort((a, b) => {
            const dateA = a.fecha_creacion;
            const dateB = b.fecha_creacion;
            return parseDolibarrDate(dateA).getTime() - parseDolibarrDate(dateB).getTime();
        });

        const userCycles: WorkCycle[] = [];
        let currentCycle: WorkCycle | null = null;

        for (const fichaje of sortedFichajes) {
            if (!fichaje || !fichaje.tipo || !fichaje.fecha_creacion) continue;

            const dateStr = fichaje.fecha_creacion;
            const fecha = parseDolibarrDate(dateStr);

            switch (fichaje.tipo) {
                case 'entrar':
                    if (currentCycle?.entrada) {
                        const lastEntryDateStr = currentCycle.entrada.fecha_creacion;
                        const hoursFromLastEntry = differenceInMinutes(fecha, parseDolibarrDate(lastEntryDateStr)) / 60;
                        if (hoursFromLastEntry > 12) {
                            currentCycle.salida = { ...currentCycle.entrada, id: '-1', tipo: 'salir', fecha_creacion: currentCycle.entrada.fecha_creacion, observaciones: 'Cierre automático > 12h' };
                            userCycles.push(currentCycle);
                            currentCycle = null;
                        }
                    }
                    if (!currentCycle) {
                        currentCycle = { entrada: { ...fichaje, tipo: 'entrar', fecha_creacion: dateStr }, pausas: [], fecha: dateStr, fk_user: fichaje.fk_user };
                    }
                    break;

                case 'salir':
                    if (currentCycle) {
                        currentCycle.salida = { ...fichaje, tipo: 'salir', fecha_creacion: dateStr };
                        const entradaDateStr = currentCycle.entrada.fecha_creacion;
                        const tiempoTotal = differenceInMinutes(fecha, parseDolibarrDate(entradaDateStr));
                        let tiempoPausado = 0;
                        currentCycle.pausas.forEach(p => {
                            if (p.inicio && p.fin) {
                                const finS = p.fin.fecha_creacion;
                                const iniS = p.inicio.fecha_creacion;
                                tiempoPausado += differenceInMinutes(parseDolibarrDate(finS), parseDolibarrDate(iniS));
                            }
                        });
                        currentCycle.duracion_total = tiempoTotal;
                        currentCycle.duracion_pausas = tiempoPausado;
                        currentCycle.duracion_efectiva = tiempoTotal - tiempoPausado;
                        userCycles.push(currentCycle);
                        currentCycle = null;
                    }
                    break;

                case 'iniciar_pausa':
                    if (currentCycle) currentCycle.pausas.push({ inicio: { ...fichaje, tipo: 'iniciar_pausa', fecha_creacion: dateStr } });
                    break;

                case 'terminar_pausa':
                    if (currentCycle && currentCycle.pausas.length > 0) {
                        const lastP = currentCycle.pausas[currentCycle.pausas.length - 1];
                        if (!lastP.fin) lastP.fin = { ...fichaje, tipo: 'terminar_pausa', fecha_creacion: dateStr };
                    }
                    break;
            }
        }

        if (currentCycle?.entrada) {
            const now = new Date();
            const entradaDateStr = currentCycle.entrada.fecha_creacion;
            const tiempoTotal = differenceInMinutes(now, parseDolibarrDate(entradaDateStr));
            let tiempoPausado = 0;
            currentCycle.pausas.forEach(p => {
                if (p.inicio && p.fin) {
                    const finS = p.fin.fecha_creacion;
                    const iniS = p.inicio.fecha_creacion;
                    tiempoPausado += differenceInMinutes(parseDolibarrDate(finS), parseDolibarrDate(iniS));
                }
            });
            currentCycle.duracion_total = tiempoTotal;
            currentCycle.duracion_pausas = tiempoPausado;
            currentCycle.duracion_efectiva = tiempoTotal - tiempoPausado;
            userCycles.push(currentCycle);
        }

        allCycles = [...allCycles, ...userCycles];
    });

    // Ordenar todos los ciclos por fecha de entrada (más reciente primero)
    return allCycles.sort((a, b) => {
        const dateA = a.entrada.fecha_creacion;
        const dateB = b.entrada.fecha_creacion;
        return parseDolibarrDate(dateB).getTime() - parseDolibarrDate(dateA).getTime();
    });
};
