import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface GeolocationConfig {
    enabled: boolean;
    loading: boolean;
    error: string | null;
}

export function useGeolocationConfig() {
    const { user } = useAuth();
    const [config, setConfig] = useState<GeolocationConfig>({
        enabled: false,
        loading: true,
        error: null
    });

    const fetchConfig = async () => {
        if (!user || !user.id) {
            setConfig(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            setConfig(prev => ({ ...prev, loading: true, error: null }));

            const token = typeof window !== 'undefined' ? localStorage.getItem('dolibarr_token') : '';

            // Use the user config endpoint we verified earlier
            const response = await fetch(`/api/users/${user.id}/config`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'DOLAPIKEY': token || ''
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                setConfig({
                    enabled: false,
                    loading: false,
                    error: null // Silent fall back
                });
                return;
            }

            const data = await response.json();

            // Check require_geolocation param. 
            // The API returns { require_geolocation: "1", ... }
            const isEnabled = data.require_geolocation === '1' || data.require_geolocation === 1;

            setConfig({
                enabled: isEnabled,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching geolocation config:', error);
            setConfig(prev => ({
                ...prev,
                enabled: false,
                loading: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            }));
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [user?.id]); // Refetch when user changes

    return {
        ...config,
        refetch: fetchConfig
    };
}
