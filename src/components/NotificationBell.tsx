'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellDot, CalendarClock, BadgeCheck, X, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useVacations, VacationRequest } from '@/hooks/useVacations';
import { useCorrections } from '@/hooks/useCorrections';
import { CorrectionRequest } from '@/lib/admin-types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NotificationBell() {
    const { user } = useAuth();
    const { fetchVacations } = useVacations();
    const { fetchCorrections } = useCorrections();
    const [isOpen, setIsOpen] = useState(false);
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!user) return;
        setLoading(true);
        const allNotifications: any[] = [];

        try {
            // 1. Fetch Read Notifications IDs
            const readRes = await fetch(`/api/notifications/read?userId=${user.id}`);
            const readIds = readRes.ok ? await readRes.json() : [];
            const readSet = new Set(readIds as string[]);
            setReadNotificationIds(readSet);

            if (user.admin) {
                // Admin Notifications
                const [vacs, corrs] = await Promise.all([
                    fetchVacations({ estado: 'pendiente' }),
                    // Fetch corrections separately
                    (async () => {
                        const token = localStorage.getItem('dolibarr_token');
                        const res = await fetch(`/api/corrections?estado=pendiente`, {
                            headers: { 'DOLAPIKEY': token || '' }
                        });
                        return res.ok ? await res.json() : [];
                    })()
                ]);

                vacs.forEach((v: VacationRequest) => {
                    const id = `vac-${v.rowid}`;
                    if (!readSet.has(id)) {
                        allNotifications.push({
                            id,
                            type: 'vacation',
                            title: 'Solicitud de Vacaciones',
                            description: `${v.usuario} ha solicitado ${v.tipo.replace('_', ' ')}`,
                            href: '/admin/vacations',
                            date: v.fecha_creacion,
                            icon: CalendarClock,
                            color: 'text-blue-500',
                            bgColor: 'bg-blue-50'
                        });
                    }
                });

                corrs.forEach((c: CorrectionRequest) => {
                    const id = `corr-${c.rowid}`;
                    if (!readSet.has(id)) {
                        const empName = c.firstname && c.lastname ? `${c.firstname} ${c.lastname}` : (c.login || 'Un empleado');
                        allNotifications.push({
                            id,
                            type: 'correction',
                            title: 'Cambio de Jornada',
                            description: `${empName} solicita corrección de fichaje`,
                            href: '/admin/corrections',
                            date: c.date_creation,
                            icon: BadgeCheck,
                            color: 'text-purple-500',
                            bgColor: 'bg-purple-50'
                        });
                    }
                });
            } else {
                // User Notifications
                const [userVacs, userCorrs] = await Promise.all([
                    fetchVacations({ usuario: user.login }),
                    (async () => {
                        const token = localStorage.getItem('dolibarr_token');
                        const res = await fetch(`/api/corrections?fk_user=${user.id}&estado=pendiente`, {
                            headers: { 'DOLAPIKEY': token || '' }
                        });
                        return res.ok ? await res.json() : [];
                    })()
                ]);

                // 1. Vacation Status Updates
                const recentVacs = userVacs.filter(v => v.estado !== 'pendiente').slice(0, 5);
                recentVacs.forEach((v: VacationRequest) => {
                    const id = `vac-${v.rowid}-${v.estado}`; // Make ID state-dependent to show new status
                    if (!readSet.has(id)) {
                        allNotifications.push({
                            id,
                            type: 'vacation-status',
                            title: `Solicitud ${v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}`,
                            description: `Tu solicitud para el ${v.fecha_inicio} ha sido ${v.estado}`,
                            href: '/gestion',
                            date: v.fecha_aprobacion || v.fecha_creacion,
                            icon: v.estado === 'aprobado' ? BadgeCheck : X,
                            color: v.estado === 'aprobado' ? 'text-emerald-500' : 'text-red-500',
                            bgColor: v.estado === 'aprobado' ? 'bg-emerald-50' : 'bg-red-50'
                        });
                    }
                });

                // 2. Pending Admin Corrections (Action Required)
                const pendingAdminRequests = userCorrs.filter((c: CorrectionRequest) =>
                    c.fk_creator && String(c.fk_creator) !== String(c.fk_user)
                );

                pendingAdminRequests.forEach((c: CorrectionRequest) => {
                    const id = `corr-req-${c.rowid}`;
                    // Important: These usually shouldn't be dismissible until acted upon, 
                    // but for consistency we'll allow it or check logic.
                    // For now, let's treat them like others.
                    if (!readSet.has(id)) {
                        allNotifications.push({
                            id,
                            type: 'correction-request',
                            title: 'Aprobación Requerida',
                            description: 'El administrador ha propuesto un cambio en tu jornada',
                            href: '/fichajes',
                            date: c.date_creation,
                            icon: Info,
                            color: 'text-amber-500',
                            bgColor: 'bg-amber-50'
                        });
                    }
                });
            }

            // Sort by date (descending)
            allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotifications(allNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        if (!user || notifications.length === 0) return;

        const idsToMark = notifications.map(n => n.id);

        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    notificationIds: idsToMark
                })
            });

            // Optimistic update
            setNotifications([]);
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            toast.error('Error al actualizar notificaciones');
        }
    };

    const markOneAsRead = async (id: string, href: string) => {
        if (!user) return;
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    notificationIds: [id]
                })
            });
            // Don't clear list immediately if navigating, but if stayed logic would be:
            // setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000 * 5); // Check every 5 min
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasUnread = notifications.length > 0;

    if (!user) return null;

    return (
        <>
            {/* Blurred Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-white/40 backdrop-blur-md z-[90] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="relative" ref={bellRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative p-2.5 rounded-2xl transition-all duration-300 z-[100] ${isOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50 border border-gray-100 shadow-sm'
                        }`}
                >
                    <Bell className="w-6 h-6" />
                    {hasUnread && !isOpen && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-3 w-[320px] md:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                Notificaciones
                                {hasUnread && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider text-xs">
                                        {notifications.length} NUEVAS
                                    </span>
                                )}
                            </h4>
                            <div className="flex items-center gap-2">
                                {hasUnread && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors mr-2"
                                    >
                                        Marcar leídas
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm font-medium">Buscando novedades...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                        <Bell size={32} />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-bold text-sm">Todo al día</p>
                                        <p className="text-gray-400 text-xs mt-1">No tienes mejores notificaciones pendientes</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <Link
                                            key={notif.id}
                                            href={notif.href}
                                            onClick={() => {
                                                markOneAsRead(notif.id, notif.href);
                                                setIsOpen(false);
                                            }}
                                            className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl ${notif.bgColor} ${notif.color} flex items-center justify-center border border-white shadow-sm`}>
                                                <notif.icon size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">
                                                        {new Date(notif.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 font-medium">
                                                    {notif.description}
                                                </p>
                                                <div className="flex items-center gap-1 mt-2 text-primary font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Ver detalle <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Info size={12} /> Desliza para ver más
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
