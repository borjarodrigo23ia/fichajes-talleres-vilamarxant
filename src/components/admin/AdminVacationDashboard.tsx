import React, { useEffect, useState } from 'react';
import { useVacations, VacationRequest } from '@/hooks/useVacations';
import { Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Palmtree, HeartPulse, ContactRound, User, Check, X } from 'lucide-react';

export default function AdminVacationDashboard() {
    const { fetchVacations, approveVacation, rejectVacation } = useVacations();
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('pendiente');
    const [searchTerm, setSearchTerm] = useState('');

    const loadRequests = async () => {
        setLoading(true);
        // Fetch all (or filter by backend if needed, for now client filter is easier for small dataset)
        const data = await fetchVacations();
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (confirm('¿Aprobar solicitud?')) {
            const result = await approveVacation(id, 'Aprobado por administrador');
            if (result.success) loadRequests();
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Motivo del rechazo:');
        if (reason !== null) {
            const result = await rejectVacation(id, reason);
            if (result.success) loadRequests();
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const statusOptions = [
        { id: 'pendiente', label: 'Pendientes' },
        { id: 'aprobado', label: 'Aprobados' },
        { id: 'rechazado', label: 'Rechazados' },
        { id: 'all', label: 'Todos' }
    ];

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.estado === filterStatus;
        const matchesSearch = req.usuario.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case 'enfermedad': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'asuntos_propios': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    const getTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'enfermedad': return 'Baja / Enfermedad';
            case 'asuntos_propios': return 'Asuntos Propios';
            default: return 'Vacaciones';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                    <div className="flex bg-gray-100/50 dark:bg-zinc-800 p-1.5 rounded-2xl min-w-max">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setFilterStatus(opt.id)}
                                className={`
                                    px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap
                                    ${filterStatus === opt.id
                                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50'
                                    }
                                `}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full xl:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por empleado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/20 outline-none transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-medium">Cargando solicitudes...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Calendar size={32} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron solicitudes</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div
                            key={req.rowid}
                            className={`
                                group relative bg-white dark:bg-zinc-900 rounded-3xl p-6 border transition-all duration-300 flex flex-col
                                ${req.estado === 'pendiente'
                                    ? 'border-indigo-100 dark:border-indigo-900/20 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10'
                                    : 'border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md'
                                }
                            `}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold
                                        ${req.estado === 'pendiente' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'}
                                    `}>
                                        {req.usuario.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                                            {req.usuario}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Solicitado: {formatDate(req.fecha_creacion.split(' ')[0])}
                                        </p>
                                    </div>
                                </div>
                                {req.estado === 'pendiente' && (
                                    <span className="flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </span>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-3 flex-1">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${getTypeColor(req.tipo)}`}>
                                    <Palmtree size={12} />
                                    {getTypeLabel(req.tipo)}
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/50">
                                    <div className="flex-1 text-center border-r border-gray-200 dark:border-zinc-700/50 pr-2">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Desde</div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{formatDate(req.fecha_inicio)}</div>
                                    </div>
                                    <div className="flex-1 text-center pl-2">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Hasta</div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{formatDate(req.fecha_fin)}</div>
                                    </div>
                                </div>

                                {req.comentarios && (
                                    <div className="px-3 py-2 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                        <p className="text-xs text-yellow-700 dark:text-yellow-500 italic">"{req.comentarios}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                {req.estado === 'pendiente' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleReject(req.rowid)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            RECHAZAR
                                        </button>
                                        <button
                                            onClick={() => handleApprove(req.rowid)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-900/10"
                                        >
                                            APROBAR
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold ${req.estado === 'aprobado'
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400'
                                        : 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400'
                                        }`}>
                                        {req.estado === 'aprobado' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {req.estado === 'aprobado' ? 'SOLICITUD APROBADA' : 'SOLICITUD RECHAZADA'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
