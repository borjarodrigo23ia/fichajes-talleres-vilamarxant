import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        // Intentamos con /setupempresaapi que es lo que mapea SetupEmpresaApi
        const response = await fetch(`${apiUrl}/setupempresaapi`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            // Si /setupempresaapi falla, intentamos /setupempresa por si acaso
            const responseAlt = await fetch(`${apiUrl}/setupempresa`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'DOLAPIKEY': apiKey
                },
                cache: 'no-store'
            });

            if (!responseAlt.ok) {
                return NextResponse.json(
                    { error: 'Error al obtener setup de Dolibarr' },
                    { status: responseAlt.status }
                );
            }
            return NextResponse.json(await responseAlt.json());
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API SetupEmpresa Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        const response = await fetch(`${apiUrl}/setupempresaapi`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Error al actualizar setup en Dolibarr' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API SetupEmpresa Update Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
