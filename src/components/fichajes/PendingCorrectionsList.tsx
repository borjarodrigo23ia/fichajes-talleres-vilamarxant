'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCorrections } from '@/hooks/useCorrections';
import { CorrectionRequest } from '@/lib/admin-types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, X, Building2, Clock, ArrowRight, Loader2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface PendingCorrectionsListProps {
    onActionComplete?: () => void;
}

export default function PendingCorrectionsList({ onActionComplete }: PendingCorrectionsListProps) {
    const { user } = useAuth();
    const { corrections, loading, fetchCorrections, approveCorrection, rejectCorrection } = useCorrections();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    // Fetch pending corrections for the current user
    useEffect(() => {
        if (user?.id) {
            fetchCorrections(user.id, 'pendiente');
        }
    }, [user?.id, fetchCorrections]);

    // Filter only admin-initiated corrections (where fk_creator !== fk_user)
    const adminRequests = corrections.filter(c =>
        c.fk_creator && String(c.fk_creator) !== String(c.fk_user)
    );

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        const success = await approveCorrection(id);
        if (success) {
            fetchCorrections(user?.id, 'pendiente');
            onActionComplete?.();
        }
        setProcessingId(null);
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        const success = await rejectCorrection(id);
        if (success) {
            fetchCorrections(user?.id, 'pendiente');
            onActionComplete?.();
        }
        setProcessingId(null);
    };

    // Don't render if no admin requests
    if (loading && adminRequests.length === 0) return null;
    if (adminRequests.length === 0) return null;

    const formatTime = (isoStr: string | null | undefined) => {
        if (!isoStr) return '--:--';
        try {
            return format(parseISO(isoStr), 'HH:mm');
        } catch {
            return '--:--';
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), "EEEE d 'de' MMMM", { locale: es });
        } catch {
            return dateStr;
        }
    };

    return (
        <section className="w-full animate-fade-in-up">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl overflow-hidden shadow-sm">
                {/* Header */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-100/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <Building2 size={18} className="text-amber-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-semibold text-amber-900">
                                Solicitudes de la empresa
                            </h3>
                            <p className="text-xs text-amber-600/80">
                                {adminRequests.length} {adminRequests.length === 1 ? 'cambio pendiente' : 'cambios pendientes'} de aprobación
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                            {adminRequests.length}
                        </span>
                        {expanded ? <ChevronUp size={16} className="text-amber-500" /> : <ChevronDown size={16} className="text-amber-500" />}
                    </div>
                </button>

                {/* Cards */}
                {expanded && (
                    <div className="px-4 pb-4 space-y-3">
                        {adminRequests.map((req) => (
                            <CorrectionCard
                                key={req.rowid}
                                correction={req}
                                onApprove={() => handleApprove(req.rowid)}
                                onReject={() => handleReject(req.rowid)}
                                processing={processingId === req.rowid}
                                formatTime={formatTime}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// --- Individual Correction Card ---

interface CorrectionCardProps {
    correction: CorrectionRequest;
    onApprove: () => void;
    onReject: () => void;
    processing: boolean;
    formatTime: (s: string | null | undefined) => string;
    formatDate: (s: string) => string;
}

function CorrectionCard({ correction, onApprove, onReject, processing, formatTime, formatDate }: CorrectionCardProps) {
    const pausas = typeof correction.pausas === 'string'
        ? JSON.parse(correction.pausas || '[]')
        : (correction.pausas || []);

    return (
        <div className="bg-white rounded-xl border border-amber-100 p-4 space-y-3 shadow-sm">
            {/* Date */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 capitalize">
                    {formatDate(correction.fecha_jornada)}
                </span>
                <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Pendiente
                </span>
            </div>

            {/* Time Changes */}
            <div className="space-y-1.5">
                {correction.hora_entrada && (
                    <TimeRow
                        label="Entrada"
                        original={formatTime(correction.hora_entrada_original)}
                        proposed={formatTime(correction.hora_entrada)}
                        hasChange={!!correction.hora_entrada_original && correction.hora_entrada_original !== correction.hora_entrada}
                    />
                )}
                {correction.hora_salida && (
                    <TimeRow
                        label="Salida"
                        original={formatTime(correction.hora_salida_original)}
                        proposed={formatTime(correction.hora_salida)}
                        hasChange={!!correction.hora_salida_original && correction.hora_salida_original !== correction.hora_salida}
                    />
                )}
                {pausas.length > 0 && pausas.map((p: any, i: number) => {
                    const inicio = p.inicio_iso || p.inicio || p.start || '';
                    const fin = p.fin_iso || p.fin || p.end || '';
                    return (
                        <TimeRow
                            key={i}
                            label={`Pausa ${pausas.length > 1 ? i + 1 : ''}`}
                            original={`${formatTime(p.original_inicio_iso)} - ${formatTime(p.original_fin_iso)}`}
                            proposed={`${formatTime(inicio)} - ${formatTime(fin)}`}
                            hasChange={!!p.original_inicio_iso}
                        />
                    );
                })}
            </div>

            {/* Observations */}
            {correction.observaciones && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                    {correction.observaciones}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onApprove}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium rounded-xl transition-all active:scale-[0.97]"
                >
                    {processing ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <Check size={15} />
                    )}
                    Aceptar
                </button>
                <button
                    onClick={onReject}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-red-50 disabled:bg-gray-100 text-red-500 hover:text-red-600 text-sm font-medium rounded-xl border border-red-200 transition-all active:scale-[0.97]"
                >
                    {processing ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <X size={15} />
                    )}
                    Rechazar
                </button>
            </div>
        </div>
    );
}

// --- Time Row ---

function TimeRow({ label, original, proposed, hasChange }: {
    label: string;
    original: string;
    proposed: string;
    hasChange: boolean;
}) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 w-14 shrink-0">{label}</span>
            {hasChange ? (
                <>
                    <span className="text-gray-400 line-through font-mono">{original}</span>
                    <ArrowRight size={12} className="text-amber-400 shrink-0" />
                    <span className="text-gray-800 font-semibold font-mono">{proposed}</span>
                </>
            ) : (
                <span className="text-gray-800 font-semibold font-mono">{proposed}</span>
            )}
        </div>
    );
}
