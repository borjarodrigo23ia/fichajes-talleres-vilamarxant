import { useState, useEffect } from 'react';

interface LogoutAfterClockConfigState {
    enabled: boolean;
    loading: boolean;
    error: string | null;
}

export function useLogoutAfterClockConfig() {
    const [state, setState] = useState<LogoutAfterClockConfigState>({
        enabled: false, // Default para login-app
        loading: true,
        error: null
    });

    const fetchConfig = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetch('/api/config/logout-after-clock', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                // Fallback
                setState({ enabled: false, loading: false, error: null });
                return;
            }
            const data = await res.json();
            setState({ enabled: !!data.enabled, loading: false, error: null });
        } catch (e: any) {
            setState(prev => ({ ...prev, loading: false, error: e?.message || 'Error', enabled: false }));
        }
    };

    useEffect(() => { fetchConfig(); }, []);

    return { ...state, refetch: fetchConfig };
}
