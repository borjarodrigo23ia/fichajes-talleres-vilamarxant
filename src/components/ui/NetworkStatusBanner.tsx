'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;

        // Sync initial state on mount
        setIsOnline(navigator.onLine);
        setIsVisible(!navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            // Keep visible for a moment to show "Back online" if we want, 
            // but for now let's just hide it.
            setTimeout(() => setIsVisible(false), 3000);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!mounted || !isVisible) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className={`flex items-center justify-center gap-3 px-4 py-2 text-white text-sm font-bold shadow-lg ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {isOnline ? (
                    <>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        <span>Conexión restablecida. Sincronizando...</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={16} className="animate-pulse" />
                        <span className="tracking-tight uppercase">Modo sin conexión - Los fichajes se guardarán localmente</span>
                    </>
                )}
            </div>
        </div>
    );
};
