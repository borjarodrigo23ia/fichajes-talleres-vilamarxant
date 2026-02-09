import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    try {
        const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/jornadas/${id}`, {
            method: 'DELETE',
            headers: {
                'DOLAPIKEY': apiKey
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: 'Error deleting shift', details: errorText }, { status: res.status });
        }

        // 204 No Content is common for DELETE, but let's see what backend returns. 
        // Backend returns: array('success' => true)
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    try {
        const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/jornadas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: 'Error updating shift', details: errorText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
