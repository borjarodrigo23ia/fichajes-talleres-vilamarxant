'use client';

import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { PageHeader } from '@/components/ui/PageHeader';
import { HouseHeart } from 'lucide-react';
import CompanyForm from '@/components/admin/CompanyForm';

export default function CompanyPage() {
    return (
        <div className="flex min-h-screen bg-[#FAFBFC]">
            <div className="hidden md:block">
                <Sidebar />
            </div>
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 pb-32">
                <PageHeader
                    title="Configuración Empresa"
                    subtitle="Gestiona la identidad visual y datos fiscales de la empresa"
                    badge="Administración"
                    icon={HouseHeart}
                    showBack
                    isLive={false}
                />

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CompanyForm />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
