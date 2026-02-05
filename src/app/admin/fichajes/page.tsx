'use client';
import { useState, useMemo } from 'react';
import { useFichajes } from '@/hooks/useFichajes';
import { useUsers } from '@/hooks/useUsers';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useRouter } from 'next/navigation';
import { HistoryList } from '@/components/fichajes/HistoryList';
import { CheckboxDropdown } from '@/components/ui/CheckboxDropdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Filter, CalendarClock } from 'lucide-react';

export default function AdminFichajesPage() {
    const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState<string[]>(['0']);
    const { users, loading: loadingUsers } = useUsers();

    // Pass comma-separated IDs to useFichajes
    const { workCycles, loading } = useFichajes({
        fkUser: selectedUsers.includes('0') ? '0' : selectedUsers.join(',')
    });

    const handleUserToggle = (id: string) => {
        setSelectedUsers(prev => {
            if (id === '0') return ['0']; // selecting "All" clears others

            const newSelection = prev.includes('0') ? [] : [...prev];
            if (newSelection.includes(id)) {
                const updated = newSelection.filter(uid => uid !== id);
                return updated.length === 0 ? ['0'] : updated;
            } else {
                return [...newSelection, id];
            }
        });
    };

    // --- Statistics Computation ---
    const stats = useMemo(() => {
        if (!workCycles?.length) return { totalHours: 0, activeNow: 0, totalSessions: 0 };

        let totalMinutes = 0;
        let activeNow = 0;

        workCycles.forEach(cycle => {
            if (cycle.duracion_efectiva) totalMinutes += cycle.duracion_efectiva;
            if (!cycle.salida) activeNow++;
        });

        return {
            totalHours: Math.round(totalMinutes / 60),
            activeNow,
            totalSessions: workCycles.length
        };
    }, [workCycles]);

    const getLabel = () => {
        if (selectedUsers.includes('0')) return 'Todos los empleados';
        if (selectedUsers.length === 1) {
            const u = users.find(u => u.id === selectedUsers[0]);
            return u ? `${u.firstname || u.login}` : 'Filtrar';
        }
        return `${selectedUsers.length} empleados`;
    };

    return (
        <div className="flex min-h-screen bg-[#FAFBFC]">
            <div className="hidden md:block"><Sidebar /></div>
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 pb-32">
                <PageHeader
                    title={<>Historial <span className="text-primary italic">Global</span></>}
                    subtitle="Consulta los registros de jornada de todos los usuarios"
                    badge="Administración"
                    icon={CalendarClock}
                    showBack
                    isLive
                >
                    <CheckboxDropdown
                        label={getLabel()}
                        options={[
                            { id: '0', label: 'Todos los empleados' },
                            ...users.map(u => ({ id: u.id, label: `${u.firstname || u.login} ${u.lastname}` }))
                        ]}
                        selectedValues={selectedUsers}
                        onToggle={handleUserToggle}
                        className="z-50"
                    />
                </PageHeader>


                {/* Stats Section - Small Square Badges with Visible Color Accents */}
                <div className="flex flex-nowrap gap-4 mb-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                    <div className="relative overflow-hidden w-32 aspect-square bg-white p-4 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-md group flex flex-col items-center justify-center text-center shrink-0">
                        {/* Blue Gradient Accent - More Visible */}
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/20 blur-xl rounded-full" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-blue-50/30 to-blue-100/60 rounded-br-[2rem]" />

                        <p className="relative z-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-500 transition-colors leading-none">Horas</p>
                        <span className="relative z-10 text-3xl font-black text-[#121726] leading-none mb-1">{stats.totalHours}</span>
                        <span className="relative z-10 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Totales</span>
                    </div>

                    <div className="relative overflow-hidden w-32 aspect-square bg-white p-4 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-md group flex flex-col items-center justify-center text-center shrink-0">
                        {/* Green Gradient Accent - More Visible */}
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-green-500/25 blur-xl rounded-full" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-green-50/30 to-green-100/60 rounded-br-[2rem]" />

                        <p className="relative z-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 group-hover:text-green-500 transition-colors leading-none">Activos</p>
                        <span className="relative z-10 text-3xl font-black text-green-500 leading-none mb-1">{stats.activeNow}</span>
                        <span className="relative z-10 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ahora</span>
                    </div>

                    <div className="relative overflow-hidden w-32 aspect-square bg-white p-4 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-md group flex flex-col items-center justify-center text-center shrink-0">
                        {/* Yellow Gradient Accent - More Visible */}
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-yellow-400/25 blur-xl rounded-full" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-yellow-50/30 to-yellow-100/60 rounded-br-[2rem]" />

                        <p className="relative z-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 group-hover:text-yellow-600 transition-colors leading-none">Sesiones</p>
                        <span className="relative z-10 text-3xl font-black text-[#121726] leading-none mb-1">{stats.totalSessions}</span>
                        <span className="relative z-10 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Jornadas</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#121726] tracking-tight mb-0.5">Actividad Reciente</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {selectedUsers.includes('0') ? 'Equipo completo' : `${selectedUsers.length} Empleados seleccionados`}
                            </p>
                        </div>
                    </div>

                    <HistoryList
                        cycles={workCycles}
                        loading={loading}
                        showUserName={selectedUsers.includes('0') || selectedUsers.length > 1}
                        isGlobal
                    />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
