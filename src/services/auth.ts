import { dolibarrRequest } from '@/services/api';

export interface LoginResponse {
    success: {
        code: number;
        token: string;
        entity: string;
        message: string;
    };
}

export const authService = {
    login: async (login: string, pass: string, reset = 0): Promise<LoginResponse> => {
        // Clear any existing tokens to ensure a clean login attempt
        // avoiding 403 Forbidden errors due to stale/invalid tokens
        if (typeof window !== 'undefined') {
            localStorage.removeItem('dolibarr_token');
            localStorage.removeItem('dolibarr_user');
        }

        return dolibarrRequest<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify({
                login,
                password: pass,
                reset
            }),
        });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('dolibarr_token');
            localStorage.removeItem('dolibarr_user');
        }
    },

    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dolibarr_token');
        }
        return null;
    },

    isAuthenticated: () => {
        const token = authService.getToken();
        return !!token;
    }
};
