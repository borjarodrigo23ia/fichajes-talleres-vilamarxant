'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { ArrowRight } from 'lucide-react';

export default function VerifyConnectionPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
    const [message, setMessage] = useState<string>('Estableciendo conexión segura...');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const token = authService.getToken();
                if (!token) throw new Error("No se encontró token de sesión");

                // Simular verificación realista con animaciones
                // 1. Initial delay
                await new Promise(resolve => setTimeout(resolve, 1200));

                const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
                const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/info`, {
                    method: 'GET',
                    headers: { 'DOLAPIKEY': token }
                });

                if (res.status >= 500) throw new Error("Error del servidor (500)");
                if (res.status === 401 || res.status === 403) throw new Error("Error de autenticación");

                setStatus('success');
                setMessage('Conexión verificada correctamente');

                // Redirect suave
                setTimeout(() => {
                    router.push('/fichajes');
                }, 1800);

            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setMessage(err.message || 'No se pudo conectar con el servidor');
            }
        };

        checkConnection();
    }, [router]);

    const handleRetry = () => {
        setStatus('checking');
        setMessage('Reintentando conexión...');
        window.location.reload();
    };

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950 font-sans p-6 overflow-hidden relative">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col items-center text-center">

                    {/* Icon Container with Height Preservation */}
                    <div className="h-32 w-32 relative flex items-center justify-center mb-8">

                        {/* Status: Checking (Pulse + Spinner) */}
                        <div className={`absolute inset-0 transition-all duration-700 transform ${status === 'checking' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                            <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_3s_linear_infinite]" />
                            <div className="absolute inset-2 rounded-full border border-primary/40 border-t-transparent animate-[spin_2s_linear_infinite]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                            </div>
                        </div>

                        {/* Status: Success (Animated SVG Check) */}
                        <div className={`absolute inset-0 transition-all duration-700 transform ${status === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 delay-100 pointer-events-none'}`}>
                            {/* Circle background */}
                            <div className="absolute inset-0 rounded-full bg-green-50 dark:bg-green-500/10 scale-0 animate-[scale-in_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }} />

                            <svg className="w-full h-full p-6 text-green-500 relative z-10" viewBox="0 0 100 100">
                                {/* Circular Path */}
                                <circle
                                    className="animate-draw-circle origin-center"
                                    cx="50" cy="50" r="45"
                                    fill="none" stroke="currentColor" strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                {/* Checkmark Path */}
                                <path
                                    className="animate-draw-check"
                                    d="M30 52 L45 67 L75 35"
                                    fill="none" stroke="currentColor" strokeWidth="5"
                                    strokeLinecap="round" strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {/* Status: Error (Red Cross) */}
                        <div className={`absolute inset-0 transition-all duration-700 transform ${status === 'error' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                            <div className="absolute inset-0 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Text Animations */}
                    <div className="space-y-3 relative h-24 w-full">
                        <div className={`absolute inset-0 w-full transition-all duration-500 ${status === 'checking' ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                            <h1 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Verificando Conexión</h1>
                            <p className="text-gray-500 text-sm animate-pulse">{message}</p>
                        </div>

                        <div className={`absolute inset-0 w-full transition-all duration-500 ${status === 'success' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <h1 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">¡Todo listo!</h1>
                            <p className="text-gray-500 text-sm">{message}</p>
                            <div className="mt-4 flex justify-center text-primary text-xs font-medium items-center gap-1 opacity-60">
                                Redirigiendo <ArrowRight size={12} className="animate-fade-in-up" />
                            </div>
                        </div>

                        <div className={`absolute inset-0 w-full transition-all duration-500 ${status === 'error' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <h1 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-500">Error de Conexión</h1>
                            <p className="text-gray-500 text-sm">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Error Actions */}
                <div className={`mt-8 transition-all duration-500 ${status === 'error' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRetry}
                            className="w-full h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                        >
                            Reintentar Conexión
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center"
                        >
                            Volver al Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
