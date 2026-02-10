'use client';

import React, { useState, useEffect } from 'react';
import { History, User, Clock, Info, ArrowRight, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface AuditLog {
    id_log: string;
    id_fichaje: string;
    usuario_editor: string;
    usuario_nombre: string;
    fecha_modificacion: string;
    campo_modificado: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    comentario: string;
}

interface AuditHistoryListProps {
    userId?: string;
    limit?: number;
}

export default function AuditHistoryList({ userId, limit }: AuditHistoryListProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAuditLogs();
    }, [userId]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('dolibarr_token');
            const url = userId
                ? `/api/fichajes/history?id_user=${userId}`
                : `/api/fichajes/history`;

            const response = await fetch(url, {
                headers: {
                    'DOLAPIKEY': token || ''
                }
            });

            if (!response.ok) throw new Error('Error al obtener auditoría');

            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('No se pudo cargar el registro de auditoría');
        } finally {
            setLoading(false);
        }
    };

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            'fk_user': 'ID de Usuario',
            'usuario': 'Nombre de Usuario',
            'tipo': 'Tipo de Fichaje',
            'observaciones': 'Observaciones',
            'fecha_creacion': 'Fecha y Hora',
            'latitud': 'Latitud',
            'longitud': 'Longitud',
            'estado_aceptacion': 'Aceptación',
            'hora_entrada': 'Entrada',
            'hora_salida': 'Salida',
            'total_pausa': 'Total Pausa',
            'total_trabajo': 'Total Trabajo'
        };
        return labels[field] || field;
    };

    const filteredLogs = logs.filter(log =>
        log.usuario_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.campo_modificado.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getFieldLabel(log.campo_modificado).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.comentario && log.comentario.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Consultando registro de auditoría...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, campo o comentario..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchAuditLogs}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors shrink-0"
                >
                    <History size={16} />
                    Actualizar
                </button>
            </div>

            {filteredLogs.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} className="text-gray-200" />
                    </div>
                    <p className="font-bold text-gray-900 tracking-tight text-lg">No hay cambios registrados</p>
                    <p className="text-sm font-medium mt-1">No se han encontrado modificaciones que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredLogs.map((log) => (
                        <div key={log.id_log} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: User & Date */}
                                <div className="md:w-48 shrink-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-gray-900 font-black text-sm tracking-tight truncate">
                                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                            <User size={14} />
                                        </div>
                                        {log.usuario_nombre}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                                        <Clock size={12} />
                                        {format(new Date(log.fecha_modificacion), "d MMM yyyy, HH:mm", { locale: es })}
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">
                                            ID Result: #{log.id_fichaje}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Change detail */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black px-2.5 py-1 bg-blue-600 text-white rounded-lg uppercase tracking-wider shadow-sm shadow-blue-200">
                                            {getFieldLabel(log.campo_modificado)}
                                        </span>
                                        <div className="h-px bg-gray-100 flex-1" />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100/50 text-sm text-gray-500 line-through decoration-red-200 decoration-2">
                                            {log.valor_anterior || '(vacío)'}
                                        </div>
                                        <div className="flex items-center justify-center text-gray-300">
                                            <ArrowRight size={18} className="rotate-90 sm:rotate-0" />
                                        </div>
                                        <div className="flex-1 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 text-sm text-gray-900 font-bold">
                                            {log.valor_nuevo || '(vacío)'}
                                        </div>
                                    </div>

                                    {log.comentario && (
                                        <div className="mt-2 p-3 bg-amber-50/30 rounded-2xl border border-amber-100/20 flex gap-3 items-start">
                                            <Info size={14} className="text-amber-400 mt-1 shrink-0" />
                                            <p className="text-xs text-amber-700/80 font-medium italic">
                                                "{log.comentario}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
