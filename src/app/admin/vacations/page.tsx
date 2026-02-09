'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import AdminVacationDashboard from '@/components/admin/AdminVacationDashboard';
import VacationCalendarView from '@/components/admin/VacationCalendarView';
import VacationDaysBulkAssign from '@/components/admin/VacationDaysBulkAssign';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Palmtree, Calendar as CalendarIcon, ListTodo } from 'lucide-react';
import { useVacations } from '@/hooks/useVacations';

export default function AdminVacationsPage() {
    const [activeTab, setActiveTab] = React.useState<'calendar' | 'requests'>('calendar');
    const [pendingCount, setPendingCount] = React.useState(0);
    const { fetchVacations } = useVacations(); // We need to import useVacations

    React.useEffect(() => {
        const loadPendingCount = async () => {
            const data = await fetchVacations(); // This fetches all. Maybe filter?
            const pending = data.filter(r => r.estado === 'pendiente').length;
            setPendingCount(pending);
        };
        loadPendingCount();
    }, [fetchVacations]);

    return (
        <div className="flex min-h-screen bg-[#FAFBFC] dark:bg-black">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 pb-32">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    <PageHeader
                        title="Gestión de Vacaciones"
                        subtitle="Administración y aprobación de solicitudes"
                        icon={Palmtree}
                        showBack
                        badge="Administración"
                    />

                    {/* Custom Tabs */}
                    <div className="flex bg-gray-100/80 dark:bg-zinc-900 p-1.5 rounded-2xl w-full md:w-fit">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'calendar'
                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            <CalendarIcon size={18} />
                            <span>Gestión</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests'
                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            <ListTodo size={18} />
                            <span>Solicitudes</span>
                            {pendingCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ml-1 leading-none shadow-sm">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'calendar' ? (
                            <>
                                <VacationCalendarView />
                                <VacationDaysBulkAssign />
                            </>
                        ) : (
                            <AdminVacationDashboard />
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
