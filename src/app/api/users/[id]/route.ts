import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

        // Map incoming fields to Dolibarr user fields if necessary
        // Dolibarr expects partial updates in some versions, or full object in others.
        // Usually PUT /users/{id} works for updates.

        const response = await fetch(`${apiUrl}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Dolibarr PUT Error:", response.status, errorText);
            return NextResponse.json({
                error: 'Error al actualizar usuario',
                details: errorText,
                message: errorText // Pass through for frontend to show if needed
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        const response = await fetch(`${apiUrl}/users/${id}`, {
            headers: { 'DOLAPIKEY': apiKey }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Error al obtener usuario' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
