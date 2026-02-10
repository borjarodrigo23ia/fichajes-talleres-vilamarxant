import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

        // Fetch pending corrections for the current user
        // We assume fk_user is managed by the caller or we can extract it if needed, 
        // but typically Dolibarr API filters by the token's user if fk_user is omitted or specific.
        // For now, let's fetch all 'pendiente' corrections and let the component handle filtering if needed,
        // or better, proxy to /fichajestrabajadoresapi/corrections?estado=pendiente
        const response = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections?estado=pendiente`, {
            headers: { 'DOLAPIKEY': apiKey },
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Error al obtener cambios pendientes' }, { status: response.status });
        }

        const data = await response.json();

        // Helper to normalize dates (handles timestamps and ISO strings)
        const normalizeDate = (val: any) => {
            if (!val) return null;
            // If it's a numeric timestamp (string or number like 1739184000)
            if (!isNaN(Number(val)) && !String(val).includes('-') && !String(val).includes(':')) {
                try {
                    const ts = Number(val);
                    const d = new Date(ts > 10000000000 ? ts : ts * 1000);
                    if (isNaN(d.getTime())) return val;

                    // Return YYYY-MM-DD HH:mm:ss for parseDolibarrDate compatibility (Local Time)
                    const Y = d.getFullYear();
                    const M = String(d.getMonth() + 1).padStart(2, '0');
                    const D = String(d.getDate()).padStart(2, '0');
                    const h = String(d.getHours()).padStart(2, '0');
                    const m = String(d.getMinutes()).padStart(2, '0');
                    const s = String(d.getSeconds()).padStart(2, '0');
                    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
                } catch (e) {
                    return val;
                }
            }
            return val;
        };

        // Map to the format expected by AdminChangeRequestModal
        const pending = Array.isArray(data) ? data.map((item: any) => ({
            id: item.rowid,
            tipo: item.id_tipo === '1' ? 'entrada' : 'salida',
            fecha_creacion_iso: normalizeDate(item.valor_nuevo || item.fecha_evento || item.fecha_creacion || item.fecha_nueva), // El nuevo horario propuesto
            fecha_anterior_iso: normalizeDate(item.valor_anterior || item.fecha_anterior || item.fecha_original || item.fecha_actual || item.fecha_prevvia || item.old_fecha || item.fecha_anterior_evento || item.fecha_anterior_correcta), // El horario original
            observaciones: item.motivo || item.observaciones || 'Sin observaciones',
            usuario_nombre: item.usuario_nombre
        })) : [];

        return NextResponse.json(pending);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
