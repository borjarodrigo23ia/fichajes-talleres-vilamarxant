'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const hasPermission = (permission: string) => {
        return true;
    };

    const refreshUser = async () => {
        const token = authService.getToken();
        const storedUser = localStorage.getItem('dolibarr_user');

        if (token && storedUser) {
            try {
                // Fetch real user info to get admin status and ID
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'DOLAPIKEY': token,
                        'X-Dolibarr-Login': storedUser
                    }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser({
                        id: userData.id,
                        login: userData.login,
                        entity: userData.entity || '1',
                        firstname: userData.firstname,
                        lastname: userData.lastname,
                        email: userData.email,
                        user_mobile: userData.user_mobile,
                        admin: userData.admin === '1' || userData.admin === true
                    });
                } else {
                    const errDetail = await res.text();
                    console.error('Failed to fetch user profile:', res.status, errDetail);
                    setUser({
                        id: '0',
                        login: storedUser,
                        entity: '1',
                        firstname: storedUser,
                        admin: false
                    });
                }
            } catch (e) {
                console.error(e);
                setUser({
                    id: '0',
                    login: storedUser,
                    entity: '1',
                    firstname: storedUser,
                    admin: false
                });
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authService.login(username, password);
            if (response.success && response.success.code === 200) {
                localStorage.setItem('dolibarr_token', response.success.token);
                localStorage.setItem('dolibarr_user', username);
                await refreshUser(); // Update state immediately
                return { success: true };
            }
            return { success: false, message: 'Credenciales inválidas' };
            return { success: false, message: 'Credenciales inválidas' };
        } catch (e: any) {
            console.error('Login error:', e);
            // Return the actual error message if available
            return {
                success: false,
                message: e.message || 'Error de conexión'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);

        // Force complete cleanup by dispatching a custom event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, logout, hasPermission, login, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
