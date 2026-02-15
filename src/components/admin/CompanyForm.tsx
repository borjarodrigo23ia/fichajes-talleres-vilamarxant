'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { CompanyService, CompanySetup } from '@/lib/company-service';
import { companySchema, CompanyFormData } from '@/lib/schemas/company-schema';
import { Loader2, Save, Upload, Trash2, Check, Building2, Globe, Phone, Mail, X, CircleCheck, BadgeInfo, MapPin } from 'lucide-react';

export default function CompanyForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companyData, setCompanyData] = useState<CompanySetup | null>(null);
    const [token, setToken] = useState<string>('');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema)
    });

    // Watch values for the "Header" live preview
    const watchedName = watch('name');
    const watchedSiren = watch('siren');
    const watchedTown = watch('town');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('dolibarr_token') || '');
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await CompanyService.getSetup();
            setCompanyData(data);
            reset({
                name: data.name,
                address: data.address,
                zip: data.zip,
                town: data.town,
                phone: data.phone,
                email: data.email,
                url: data.url,
                siren: data.siren, // CIF/NIF
                capital: data.capital,
                socialobject: data.socialobject
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos de empresa');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CompanyFormData) => {
        try {
            setSaving(true);
            await CompanyService.updateSetup(data);
            toast.success('Datos actualizados correctamente');
            loadData(); // Reload to ensure sync
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar datos');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, squarred: boolean = false) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        try {
            toast.loading('Subiendo logo...', { id: 'upload' });
            await CompanyService.uploadLogo(file, squarred);
            toast.success('Logo actualizado', { id: 'upload' });
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al subir logo', { id: 'upload' });
        }
    };

    const handleDeleteLogo = async (squarred: boolean = false) => {
        if (!confirm('¿Estás seguro de querer borrar este logo?')) return;
        try {
            await CompanyService.deleteLogo(squarred);
            toast.success('Logo borrado');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al borrar logo');
        }
    }

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [companyData?.logo_small]);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    // Logo URL for preview
    const logoUrl = companyData?.logo_small && token
        ? `/api/setupempresa/logo?file=${companyData.logo_small}&token=${token}`
        : null;

    return (
        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)]">

                {/* REFINED INTEGRATED HEADER: LEFT LOGO | RIGHT INFO */}
                <div className="px-10 py-10 border-b border-gray-50 bg-gradient-to-br from-gray-50/50 to-white flex flex-col md:flex-row items-center md:items-start gap-10">

                    {/* LEFT: Logo Section */}
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 shadow-md flex items-center justify-center transition-all group-hover:border-black/10 group-hover:shadow-xl group-hover:-translate-y-1 overflow-hidden relative">
                            {logoUrl && !imageError ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo Empresa"
                                    className="w-full h-full object-contain p-4 transition-opacity duration-300"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="text-center space-y-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Upload size={24} strokeWidth={1.5} className="mx-auto" />
                                    <p className="text-[8px] font-black uppercase tracking-widest">Añadir Logo</p>
                                </div>
                            )}

                            <input
                                type="file"
                                id="logo-header"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, false)}
                            />
                            <label
                                htmlFor="logo-header"
                                className="absolute inset-0 cursor-pointer z-10"
                                title="Haga clic para subir logotipo"
                            />
                        </div>
                        {companyData?.logo_small && (
                            <button
                                type="button"
                                onClick={() => handleDeleteLogo(false)}
                                className="absolute -top-2 -right-2 p-2 bg-white text-red-500 shadow-lg border border-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all z-20 scale-90 group-hover:scale-100"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>

                    {/* RIGHT: Company Primary Info */}
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-3xl font-black text-[#121726] tracking-tighter leading-none mb-2">
                                    {watchedName || 'Nombre de la Empresa'}
                                </h2>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full">
                                        <Building2 size={10} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {watchedSiren || 'CIF pendiente'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                                        <Globe size={10} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {watchedTown || 'Ubicación'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 font-medium max-w-xl line-clamp-2 italic">
                                {companyData?.socialobject || 'Configure el objeto social de su empresa para completar el perfil institucional.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM CONTENT */}
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Section 1: Identity */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <BadgeInfo size={16} className="text-black" />
                            <span className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Identidad Corporativa</span>
                            <div className="h-px flex-1 bg-gray-50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Razón Social *</label>
                        <input
                            {...register('name')}
                            placeholder="Nombre oficial..."
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">CIF / NIF</label>
                        <input
                            {...register('siren')}
                            placeholder="Ej. B12345678"
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Objeto Social</label>
                        <textarea
                            {...register('socialobject')}
                            rows={3}
                            placeholder="Actividad principal de la empresa..."
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Section 2: Contact */}
                    <div className="md:col-span-2 pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-black" />
                            <span className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Contacto y Ubicación</span>
                            <div className="h-px flex-1 bg-gray-50" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Dirección Postal</label>
                        <input
                            {...register('address')}
                            placeholder="Calle, número, oficina..."
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Código Postal</label>
                        <input
                            {...register('zip')}
                            placeholder="46xxx"
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Población</label>
                        <input
                            {...register('town')}
                            placeholder="Ej. Valencia"
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Phone size={10} className="text-gray-300" /> Teléfono
                        </label>
                        <input
                            {...register('phone')}
                            placeholder="+34 ..."
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Mail size={10} className="text-gray-300" /> Email Corporativo
                        </label>
                        <input
                            {...register('email')}
                            placeholder="info@empresa.com"
                            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-black/5 focus:bg-white rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-row items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 rounded-xl font-black text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-500 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                        <X size={14} strokeWidth={3} />
                        Descartar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-8 py-2.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-widest"
                    >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <CircleCheck size={14} strokeWidth={3} className="text-white" />}
                        <span>{saving ? 'Procesando...' : 'Guardar'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
