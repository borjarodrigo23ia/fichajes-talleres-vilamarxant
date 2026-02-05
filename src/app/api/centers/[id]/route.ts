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

        const response = await fetch(`${apiUrl}/fichajestrabajadoresapi/centers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Error al actualizar centro' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

        const response = await fetch(`${apiUrl}/fichajestrabajadoresapi/centers/${id}`, {
            method: 'DELETE',
            headers: { 'DOLAPIKEY': apiKey }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Error al eliminar centro' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
