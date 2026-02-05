'use client';

import { useState, useEffect, useCallback } from 'react';
import { DolibarrUser } from '@/lib/admin-types';

export const useUsers = () => {
    const [users, setUsers] = useState<DolibarrUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('dolibarr_token');
            const res = await fetch('/api/users', {
                headers: { 'DOLAPIKEY': token || '' }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al obtener usuarios');
            }

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refreshUsers: fetchUsers };
};
