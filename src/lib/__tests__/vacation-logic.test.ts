import { checkVacationOverlap, calculateVacationDays } from '../vacation-logic';
import { VacationRequest } from '../../hooks/useVacations';

describe('Vacation Logic', () => {
    const mockRequests: VacationRequest[] = [
        {
            rowid: 1,
            usuario: 'user1',
            fecha_inicio: '2026-06-01',
            fecha_fin: '2026-06-15',
            estado: 'aprobado',
            tipo: 'vacaciones',
            comentarios: '',
            aprobado_por: 'admin',
            fecha_aprobacion: '2026-01-01',
            fecha_creacion: '2026-01-01'
        },
        {
            rowid: 2,
            usuario: 'user1',
            fecha_inicio: '2026-07-01',
            fecha_fin: '2026-07-07',
            estado: 'pendiente',
            tipo: 'vacaciones',
            comentarios: '',
            aprobado_por: null,
            fecha_aprobacion: null,
            fecha_creacion: '2026-01-01'
        },
        {
            rowid: 3,
            usuario: 'user1',
            fecha_inicio: '2026-08-01',
            fecha_fin: '2026-08-10',
            estado: 'rechazado',
            tipo: 'vacaciones',
            comentarios: '',
            aprobado_por: 'admin',
            fecha_aprobacion: '2026-01-01',
            fecha_creacion: '2026-01-01'
        }
    ];

    describe('checkVacationOverlap', () => {
        it('should detect exact overlap', () => {
            const overlap = checkVacationOverlap('2026-06-01', '2026-06-15', mockRequests);
            expect(overlap?.rowid).toBe(1);
        });

        it('should detect partial overlap at start', () => {
            const overlap = checkVacationOverlap('2026-05-30', '2026-06-05', mockRequests);
            expect(overlap?.rowid).toBe(1);
        });

        it('should detect partial overlap at end', () => {
            const overlap = checkVacationOverlap('2026-06-10', '2026-06-20', mockRequests);
            expect(overlap?.rowid).toBe(1);
        });

        it('should detect inclusion overlap', () => {
            const overlap = checkVacationOverlap('2026-06-05', '2026-06-10', mockRequests);
            expect(overlap?.rowid).toBe(1);
        });

        it('should detect overlap with pending request', () => {
            const overlap = checkVacationOverlap('2026-07-02', '2026-07-04', mockRequests);
            expect(overlap?.rowid).toBe(2);
        });

        it('should NOT detect overlap with rejected request', () => {
            const overlap = checkVacationOverlap('2026-08-05', '2026-08-06', mockRequests);
            expect(overlap).toBeNull();
        });

        it('should return null for no overlap', () => {
            const overlap = checkVacationOverlap('2026-06-16', '2026-06-30', mockRequests);
            expect(overlap).toBeNull();
        });
    });

    describe('calculateVacationDays', () => {
        it('should count working days (Mon-Fri)', () => {
            // June 1 to June 5, 2026 is Mon to Fri
            expect(calculateVacationDays('2026-06-01', '2026-06-05')).toBe(5);
        });

        it('should exclude weekends', () => {
            // June 6 (Sat) to June 7 (Sun)
            expect(calculateVacationDays('2026-06-06', '2026-06-07')).toBe(0);
        });

        it('should handle ranges across weeks', () => {
            // June 1 (Mon) to June 8 (Mon) = 6 working days
            expect(calculateVacationDays('2026-06-01', '2026-06-08')).toBe(6);
        });
    });
});
