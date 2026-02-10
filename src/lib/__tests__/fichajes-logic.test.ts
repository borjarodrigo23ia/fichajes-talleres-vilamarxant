import { groupFichajesIntoCycles } from '../fichajes-logic';
import { Fichaje } from '../types';

describe('groupFichajesIntoCycles', () => {
    it('should return empty array for empty input', () => {
        expect(groupFichajesIntoCycles([])).toEqual([]);
    });

    it('should group a simple entry and exit', () => {
        const fichajes: Fichaje[] = [
            { id: '1', usuario: 'user1', fecha_creacion: '2023-10-27 08:00:00', tipo: 'entrar', fk_user: '1', latitud: '', longitud: '', observaciones: '' },
            { id: '2', usuario: 'user1', fecha_creacion: '2023-10-27 16:00:00', tipo: 'salir', fk_user: '1', latitud: '', longitud: '', observaciones: '' }
        ];

        const cycles = groupFichajesIntoCycles(fichajes);
        expect(cycles).toHaveLength(1);
        expect(cycles[0].entrada.id).toBe('1');
        expect(cycles[0].salida?.id).toBe('2');
        expect(cycles[0].duracion_total).toBe(480); // 8 hours * 60 minutes
    });

    it('should handle pauses correctly', () => {
        const fichajes: Fichaje[] = [
            { id: '1', usuario: 'user1', fecha_creacion: '2023-10-27 08:00:00', tipo: 'entrar', fk_user: '1', latitud: '', longitud: '', observaciones: '' },
            { id: '2', usuario: 'user1', fecha_creacion: '2023-10-27 12:00:00', tipo: 'iniciar_pausa', fk_user: '1', latitud: '', longitud: '', observaciones: '' },
            { id: '3', usuario: 'user1', fecha_creacion: '2023-10-27 13:00:00', tipo: 'terminar_pausa', fk_user: '1', latitud: '', longitud: '', observaciones: '' },
            { id: '4', usuario: 'user1', fecha_creacion: '2023-10-27 17:00:00', tipo: 'salir', fk_user: '1', latitud: '', longitud: '', observaciones: '' }
        ];

        const cycles = groupFichajesIntoCycles(fichajes);
        expect(cycles).toHaveLength(1);
        expect(cycles[0].pausas).toHaveLength(1);
        expect(cycles[0].duracion_total).toBe(540); // 9 hours
        expect(cycles[0].duracion_pausas).toBe(60); // 1 hour pause
        expect(cycles[0].duracion_efectiva).toBe(480); // 8 hours work
    });

    it('should handle open cycles (active shift)', () => {
        const fichajes: Fichaje[] = [
            { id: '1', usuario: 'user1', fecha_creacion: new Date().toISOString().slice(0, 19).replace('T', ' '), tipo: 'entrar', fk_user: '1', latitud: '', longitud: '', observaciones: '' }
        ];

        const cycles = groupFichajesIntoCycles(fichajes);
        expect(cycles).toHaveLength(1);
        expect(cycles[0].salida).toBeUndefined();
    });

    it('should auto-close cycles > 12 hours', () => {
        const fichajes: Fichaje[] = [
            { id: '1', usuario: 'user1', fecha_creacion: '2023-10-26 08:00:00', tipo: 'entrar', fk_user: '1', latitud: '', longitud: '', observaciones: '' },
            // Next entry is next day, so previous should auto-close
            { id: '2', usuario: 'user1', fecha_creacion: '2023-10-27 08:00:00', tipo: 'entrar', fk_user: '1', latitud: '', longitud: '', observaciones: '' }
        ];

        const cycles = groupFichajesIntoCycles(fichajes);
        expect(cycles).toHaveLength(2);
        // The older cycle (index 1 because of sort) should be auto-closed
        expect(cycles[1].salida?.id).toBe('-1');
        expect(cycles[1].salida?.observaciones).toContain('Cierre automático');
    });
});
