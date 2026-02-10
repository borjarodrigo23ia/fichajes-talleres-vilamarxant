'use client';

import { FichajeTipo } from './types';

export interface QueuedFichaje {
    id: string;
    tipo: FichajeTipo;
    fecha: string; // ISO string
    observaciones: string;
    latitud?: string;
    longitud?: string;
    usuario?: string;
}

const STORAGE_KEY = 'fichajes_offline_queue';

export const offlineStore = {
    /**
     * Adds a new fichaje to the offline queue.
     */
    enqueue: (data: Omit<QueuedFichaje, 'id' | 'fecha'>): QueuedFichaje => {
        const queue = offlineStore.getQueue();
        const newItem: QueuedFichaje = {
            ...data,
            id: crypto.randomUUID(),
            fecha: new Date().toISOString(),
        };

        queue.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        return newItem;
    },

    /**
     * Gets all queued fichajes.
     */
    getQueue: (): QueuedFichaje[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error parsing offline queue:', e);
            return [];
        }
    },

    /**
     * Removes a specific item from the queue by ID.
     */
    removeFromQueue: (id: string) => {
        const queue = offlineStore.getQueue();
        const updated = queue.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    /**
     * Clears the entire queue.
     */
    clearQueue: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
