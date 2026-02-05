import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ message: 'Manual API is alive' });
}

export async function POST(request: NextRequest) {
    console.log('[API] POST /api/fichajes/manual - Request received');
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            console.error('[API] POST /api/fichajes/manual - No authorized (missing API Key)');
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        console.log('[API] POST /api/fichajes/manual - Body:', JSON.stringify(body));

        const usuario = body.usuario;
        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        const dolibarrUrl = `${apiUrl}/fichajestrabajadoresapi/insertarJornadaManual`;
        console.log('[API] POST /api/fichajes/manual - Calling Dolibarr:', dolibarrUrl);

        const response = await fetch(dolibarrUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify({
                ...body,
                usuario: usuario
            })
        });

        const status = response.status;
        console.log('[API] POST /api/fichajes/manual - Dolibarr status:', status);

        const data = await response.json();
        console.log('[API] POST /api/fichajes/manual - Dolibarr data:', JSON.stringify(data));

        if (!response.ok) {
            return NextResponse.json(data, { status: status });
        }

        return NextResponse.json({
            success: true,
            id_jornada: data.id_jornada,
            ids_fichajes: data.ids_fichajes
        });

    } catch (error: any) {
        console.error('[API] POST /api/fichajes/manual - Error:', error);
        return NextResponse.json(
            { error: 'Error interno', details: error.message },
            { status: 500 }
        );
    }
}
