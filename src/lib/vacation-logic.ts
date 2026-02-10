import { VacationRequest } from '../hooks/useVacations';

/**
 * Checks if a new date range overlaps with any existing vacation request.
 * Only considering 'pendiente' and 'aprobado' requests.
 */
export const checkVacationOverlap = (
    newStart: string, // YYYY-MM-DD
    newEnd: string,   // YYYY-MM-DD
    existingRequests: VacationRequest[]
): VacationRequest | null => {
    const start = new Date(newStart).getTime();
    const end = new Date(newEnd).getTime();

    // Filter out rejected requests
    const relevantRequests = existingRequests.filter(r => r.estado !== 'rechazado');

    for (const request of relevantRequests) {
        const reqStart = new Date(request.fecha_inicio).getTime();
        const reqEnd = new Date(request.fecha_fin).getTime();

        // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
        if (start <= reqEnd && end >= reqStart) {
            return request;
        }
    }

    return null;
};

/**
 * Calculates the number of working days between two dates.
 * (Simple version, could be expanded with holidays)
 */
export const calculateVacationDays = (startStr: string, endStr: string): number => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let count = 0;
    const curDate = new Date(start.getTime());

    while (curDate <= end) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};
