import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // For registration form, we might not have a user token yet.
        // Fallback to server admin key for listing centers.
        const apiKey = request.headers.get('DOLAPIKEY') || process.env.DOLAPIKEY;
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        // Dolibarr custom module API path: /fichajestrabajadoresapi/centers
        const response = await fetch(`${apiUrl}/fichajestrabajadoresapi/centers`, {
            headers: { 'DOLAPIKEY': apiKey }
        });

        if (!response.ok) {
            console.error(`Error fetching centers: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Error al obtener centros' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

        const response = await fetch(`${apiUrl}/fichajestrabajadoresapi/centers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Error creating center: ${response.status}`);
            return NextResponse.json({ error: 'Error al crear centro' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
