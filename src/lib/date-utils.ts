import { parseISO } from 'date-fns';

/**
 * Parses a Dolibarr date string (YYYY-MM-DD HH:mm:ss) as a local Date object.
 * This effectively ignores the browser's timezone interpretation of ISO strings
 * and forces "what you see is what you get" behavior.
 * 
 * Example: "2026-02-02 09:56:34" -> Date object where hours=9, minutes=56 (Local)
 */
export const parseDolibarrDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();

    // Handle ISO format with T just in case
    const normalized = dateStr.replace('T', ' ');
    const parts = normalized.split(' ');

    if (parts.length < 2) {
        // Fallback for date only or invalid
        return new Date(dateStr);
    }

    const [datePart, timePart] = parts;
    const [y, m, d] = datePart.split('-').map(Number);
    const [h, min, s] = timePart.split(':').map(Number);

    // Note: Month is 0-indexed in JS Date
    return new Date(y, m - 1, d, h, min, s || 0);
};
