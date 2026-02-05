'use client';
import { useEffect } from 'react';
import { useCorrections } from '@/hooks/useCorrections';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Check, X, Clock, BadgeCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { format } from 'date-fns';

export default function AdminCorrectionsPage() {
    const { corrections, loading, fetchCorrections, approveCorrection, rejectCorrection } = useCorrections();

    useEffect(() => {
        fetchCorrections(undefined, 'pendiente');
    }, [fetchCorrections]);

    const handleApprove = async (id: string) => {
        if (await approveCorrection(id)) {
            fetchCorrections(undefined, 'pendiente');
        }
    };

    const handleReject = async (id: string) => {
        if (await rejectCorrection(id)) {
            fetchCorrections(undefined, 'pendiente');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FAFBFC]">
            <div className="hidden md:block"><Sidebar /></div>
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 pb-32">
                <PageHeader
                    title="Correcciones Pendientes"
                    subtitle="Revisa y aprueba las solicitudes de edición de jornada"
                    icon={BadgeCheck}
                    showBack
                    badge="Administración"
                />

                {loading ? (
                    <div>Cargando...</div>
                ) : corrections.length === 0 ? (
                    <div className="text-gray-500">No hay solicitudes pendientes.</div>
                ) : (
                    <div className="grid gap-4">
                        {corrections.map((c) => (
                            <div key={c.rowid} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-base md:text-lg">{c.firstname} {c.lastname} ({c.login})</span>
                                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full capitalize">{c.estado}</span>
                                    </div>
                                    <div className="text-gray-600 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                        <p><span className="font-medium">Jornada:</span> {c.fecha_jornada}</p>
                                        <p><span className="font-medium">Entrada:</span> {c.hora_entrada ? format(new Date(c.hora_entrada), 'HH:mm') : 'Sin cambios'}</p>
                                        <p><span className="font-medium">Salida:</span> {c.hora_salida ? format(new Date(c.hora_salida), 'HH:mm') : 'Sin cambios'}</p>
                                        <p><span className="font-medium">Pausas:</span> {(() => {
                                            try {
                                                if (!c.pausas) return '0';
                                                if (Array.isArray(c.pausas)) return c.pausas.length;
                                                const parsed = JSON.parse(c.pausas);
                                                return Array.isArray(parsed) ? parsed.length : '0';
                                            } catch {
                                                return '0';
                                            }
                                        })()} registradas</p>
                                    </div>
                                    {c.observaciones && (
                                        <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                            "{c.observaciones}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                                    <button
                                        onClick={() => handleApprove(c.rowid)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium border border-green-200 touch-manipulation"
                                    >
                                        <Check size={18} /> Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleReject(c.rowid)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-200 touch-manipulation"
                                    >
                                        <X size={18} /> Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <MobileNav />
        </div>
    );
}
