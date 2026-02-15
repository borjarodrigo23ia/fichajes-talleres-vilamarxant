import { fetchWithAuth } from '@/lib/api';

export interface SocialNetwork {
    id: string | null;
    url: string | null;
}

export interface CompanySetup {
    name: string;
    address: string;
    zip: string;
    town: string;
    country_id: number | null;
    country_code: string | null;
    country_label: string | null;
    state_id: number | null;
    state_code: string | null;
    state_label: string | null;
    phone: string;
    phone_mobile: string;
    email: string;
    url: string;
    note: string;
    managers: string;
    socialobject: string; // Objecto social
    capital: string;
    forme_juridique_code: string;
    siren: string; // ID Prof 1 (CIF/NIF en ES)
    siret: string; // ID Prof 2
    ape: string;   // ID Prof 3

    // Logos (filenames)
    logo: string;
    logo_small: string;
    logo_mini: string;
    logo_squarred: string;
    logo_squarred_small: string;
    logo_squarred_mini: string;

    socialnetworks: Record<string, SocialNetwork>;
}

export const CompanyService = {
    async getSetup(): Promise<CompanySetup> {
        // Llamamos al proxy local /api/setupempresa
        const response = await fetch('/api/setupempresa', {
            headers: {
                'DOLAPIKEY': typeof window !== 'undefined' ? (localStorage.getItem('dolibarr_token') || '') : ''
            }
        });
        if (!response.ok) throw new Error('Error al cargar datos');
        return response.json();
    },

    async updateSetup(data: Partial<CompanySetup>): Promise<{ success: boolean }> {
        const response = await fetch('/api/setupempresa', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': typeof window !== 'undefined' ? (localStorage.getItem('dolibarr_token') || '') : ''
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error al actualizar');
        return response.json();
    },

    async uploadLogo(file: File, squarred: boolean = false): Promise<{ success: boolean }> {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof window !== 'undefined' ? (localStorage.getItem('dolibarr_token') || '') : '';
        const endpoint = squarred ? '/api/setupempresa/logo?logo-squarred=1' : '/api/setupempresa/logo';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'DOLAPIKEY': token
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al subir logo');
        }

        return response.json();
    },

    async deleteLogo(squarred: boolean = false): Promise<{ success: boolean }> {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('dolibarr_token') || '') : '';
        const endpoint = squarred ? '/api/setupempresa/logo?logo-squarred=1' : '/api/setupempresa/logo';

        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'DOLAPIKEY': token
            }
        });

        if (!response.ok) throw new Error('Error al borrar logo');
        return response.json();
    }
};
