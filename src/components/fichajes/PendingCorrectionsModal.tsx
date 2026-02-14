'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCorrections } from '@/hooks/useCorrections';
import { Check, X, Clock, AlertTriangle, ArrowRight, Calendar, Info, ShieldCheck, ChevronLeft, ChevronRight, History, CircleCheck, CircleX, Hourglass } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { CorrectionRequest } from '@/lib/admin-types';

export default function PendingCorrectionsModal({ onActionComplete }: { onActionComplete: () => void }) {
    const { user } = useAuth();
    const { corrections, loading, fetchCorrections, approveCorrection, rejectCorrection } = useCorrections();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentCorrectionIndex, setCurrentCorrectionIndex] = useState(0);

    useEffect(() => {
        if (user) {
            fetchCorrections(user.id, 'pendiente');
        }
    }, [user, fetchCorrections]);

    const adminRequests = corrections.filter(c =>
        c.fk_creator && String(c.fk_creator) !== String(c.fk_user)
    );

    useEffect(() => {
        if (adminRequests.length > 0) {
            setIsOpen(true);
        }
    }, [adminRequests.length]);

    const handleApprove = async () => {
        const current = adminRequests[currentCorrectionIndex];
        if (!current) return;

        setProcessingId(current.rowid);
        const success = await approveCorrection(current.rowid);
        if (success) {
            toast.success('Cambio aceptado correctamente');
            // Re-fetch to update the internal adminRequests list
            fetchCorrections(user!.id, 'pendiente');
            onActionComplete();
        } else {
            toast.error('Error al aceptar el cambio');
        }
        setProcessingId(null);
    };

    const handleReject = async () => {
        const current = adminRequests[currentCorrectionIndex];
        if (!current) return;

        setProcessingId(current.rowid);
        const success = await rejectCorrection(current.rowid, 'Rechazado por el usuario');
        if (success) {
            toast.success('Cambio rechazado');
            // Re-fetch to update the internal adminRequests list
            fetchCorrections(user!.id, 'pendiente');
            onActionComplete();
        } else {
            toast.error('Error al rechazar');
        }
        setProcessingId(null);
    };

    const handleNext = () => {
        if (currentCorrectionIndex < adminRequests.length - 1) {
            setCurrentCorrectionIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0); // Cycle back
        }
    };

    const handlePrev = () => {
        if (currentCorrectionIndex > 0) {
            setCurrentCorrectionIndex(prev => prev - 1);
        } else {
            setCurrentCorrectionIndex(adminRequests.length - 1); // Cycle to end
        }
    };

    const setCurrentIndex = (index: number) => {
        setCurrentCorrectionIndex(index);
    }


    const handleDecideLater = () => {
        setIsOpen(false);
    };

    if (!isOpen || adminRequests.length === 0) return null;

    const safeIndex = currentCorrectionIndex >= adminRequests.length ? 0 : currentCorrectionIndex;
    const requestRaw = adminRequests[safeIndex];

    if (!requestRaw) return null;

    // Safety: ensure pausas is an array (sometimes Dolibarr returns JSON fields as strings)
    const request = {
        ...requestRaw,
        pausas: Array.isArray(requestRaw.pausas)
            ? requestRaw.pausas
            : (typeof requestRaw.pausas === 'string' ? JSON.parse(requestRaw.pausas) : [])
    } as CorrectionRequest;

    // Formatting helpers
    const formatDate = (d: string) => format(new Date(d), "EEEE, d 'de' MMMM", { locale: es });
    const formatTimeHelper = (d: string | null) => d ? format(new Date(d), 'HH:mm') : null;

    const formatTimeRange = (start: string | null, end: string | null) => {
        const s = formatTimeHelper(start);
        const e = formatTimeHelper(end);

        if (!s && !e) return <span className="text-gray-200">Sin registro</span>;
        if (s && e) return `${s} - ${e}`;
        if (s) return s;
        if (e) return e;
        return null;
    };

    const parseObservation = (obs: string | null) => {
        if (!obs) return "Registro modificado por el administrador";

        // Remove [ ] and format: **Motivo:** Text
        const match = obs.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
            const motivo = match[1];
            const text = match[2];
            return (
                <span>
                    <span className="font-bold text-gray-700">{motivo}:</span> {text}
                </span>
            );
        }
        return obs;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#121726]/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={handleDecideLater}
            />

            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">

                {/* Header - Minimalist with Nav */}
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-black rounded-2xl text-white shadow-lg">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h2 className="text-xl font-black text-black tracking-tight leading-none">
                                    Validar cambio
                                </h2>
                                {/* Action Type Badge */}
                                {(() => {
                                    const details = (() => {
                                        const obs = request.observaciones || '';
                                        if (obs.includes('Entrada')) return { label: 'Entrada', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
                                        if (obs.includes('Salida')) return { label: 'Salida', color: 'bg-rose-50 text-rose-600 border-rose-100' };
                                        if (obs.includes('Inicio Pausa')) return { label: 'Pausa', color: 'bg-amber-50 text-amber-600 border-amber-100' };
                                        if (obs.includes('Fin Pausa')) return { label: 'Regreso', color: 'bg-blue-50 text-blue-600 border-blue-100' };

                                        // Analyze pausas array if no specific keyword
                                        if (request.pausas && request.pausas.length > 0) {
                                            const modifiedPause = request.pausas.find(p => p.original_inicio_iso || p.original_fin_iso);
                                            if (modifiedPause) {
                                                const s = formatTimeHelper(modifiedPause.inicio_iso);
                                                const e = formatTimeHelper(modifiedPause.fin_iso);
                                                const os = formatTimeHelper(modifiedPause.original_inicio_iso || null);
                                                const oe = formatTimeHelper(modifiedPause.original_fin_iso || null);

                                                const startChanged = s !== os;
                                                const endChanged = e !== oe;

                                                if (startChanged && endChanged) return { label: 'Pausa y Regreso', color: 'bg-amber-50 text-amber-600 border-amber-100' };
                                                if (startChanged) return { label: 'Pausa', color: 'bg-amber-50 text-amber-600 border-amber-100' };
                                                if (endChanged) return { label: 'Regreso', color: 'bg-blue-50 text-blue-600 border-blue-100' };
                                            }
                                        }

                                        if (request.hora_entrada && !request.hora_salida) return { label: 'Entrada', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
                                        if (!request.hora_entrada && request.hora_salida) return { label: 'Salida', color: 'bg-rose-50 text-rose-600 border-rose-100' };
                                        return { label: 'Jornada', color: 'bg-gray-50 text-gray-600 border-gray-100' };
                                    })();

                                    return (
                                        <div className="flex">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                details.color
                                            )}>
                                                {details.label}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {adminRequests.length > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-xs font-black text-gray-300 w-12 text-center">
                                    {safeIndex + 1} / {adminRequests.length}
                                </span>
                                <button
                                    onClick={handleNext}
                                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-400 text-xs font-semibold leading-relaxed max-w-[90%]">
                        El administrador ha propuesto un cambio en tu registro. Confirma si es correcto.
                    </p>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-6">
                    {/* Date Badge */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wide">
                            <Calendar size={14} />
                            {formatDate(request.fecha_jornada)}
                        </div>
                    </div>

                    {/* Comparison Card */}
                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-6 relative overflow-hidden">

                        {/* Entry/Exit Comparison - Smart individual time display */}
                        {(() => {
                            const s = formatTimeHelper(request.hora_entrada);
                            const e = formatTimeHelper(request.hora_salida);
                            const os = formatTimeHelper(request.hora_entrada_original || null);
                            const oe = formatTimeHelper(request.hora_salida_original || null);

                            const entryChanged = s !== os && s !== null;
                            const exitChanged = e !== oe && e !== null;

                            if (!entryChanged && !exitChanged) return null;

                            // Determine what to display based on what changed
                            const previousText = entryChanged ? os : (exitChanged ? oe : null);
                            const proposedText = entryChanged ? s : (exitChanged ? e : null);

                            return (
                                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
                                    <div className="flex-1 text-center">
                                        <div className="text-[9px] font-black uppercase text-gray-400 mb-1">Anterior</div>
                                        <div className="text-lg font-bold text-gray-300 line-through">
                                            {previousText || '--:--'}
                                        </div>
                                    </div>

                                    <div className="text-gray-200">
                                        <ArrowRight size={20} />
                                    </div>

                                    <div className="flex-1 text-center">
                                        <div className="text-[9px] font-black uppercase text-black mb-1">Propuesto</div>
                                        <div className="text-lg font-black text-black">
                                            {proposedText || '--:--'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Pause Comparison - Iterates through modified pauses */}
                        {request.pausas && request.pausas.length > 0 && request.pausas.map((pausa, idx) => {
                            const hasChange = pausa.original_inicio_iso || pausa.original_fin_iso;
                            if (!hasChange) return null;

                            const s = formatTimeHelper(pausa.inicio_iso);
                            const e = formatTimeHelper(pausa.fin_iso);
                            const os = formatTimeHelper(pausa.original_inicio_iso || null);
                            const oe = formatTimeHelper(pausa.original_fin_iso || null);

                            const startChanged = s !== os;
                            const endChanged = e !== oe;

                            // Helper to show only what changed
                            const getSides = () => {
                                if (startChanged) return { prev: os, prop: s };
                                if (endChanged) return { prev: oe, prop: e };
                                return { prev: '--:--', prop: '--:--' };
                            };

                            const { prev, prop } = getSides();

                            return (
                                <div key={idx} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10 transition-all hover:border-gray-200">
                                        <div className="flex-1 text-center">
                                            <div className="text-[9px] font-black uppercase text-gray-400 mb-1">Pausa Anterior</div>
                                            <div className="text-lg font-bold text-gray-300 line-through">
                                                {prev}
                                            </div>
                                        </div>

                                        <div className="text-gray-200">
                                            <ArrowRight size={20} />
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div className="text-[9px] font-black uppercase text-black mb-1">Propuesta</div>
                                            <div className="text-lg font-black text-black">
                                                {prop}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Admin Note */}
                        <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Observaciones del administrador</span>
                            <div className="bg-white/80 rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-3">
                                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    {parseObservation(request.observaciones)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={!!processingId}
                                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-50"
                            >
                                {processingId === request.rowid ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CircleCheck size={20} />
                                )}
                                Aceptar
                            </button>

                            <button
                                onClick={handleReject}
                                disabled={!!processingId}
                                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-50"
                            >
                                <CircleX size={20} />
                                Rechazar
                            </button>
                        </div>

                        <button
                            onClick={handleDecideLater}
                            className="w-full p-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            <Hourglass size={14} />
                            Decidir más tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
