import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        // Basic filtering if needed
        const limit = searchParams.get('limit') || '100';

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        // Fetch users (active only usually preferable)
        const response = await fetch(`${apiUrl}/users?limit=${limit}&sqlfilters=(t.statut:=:1)`, {
            headers: { 'DOLAPIKEY': apiKey }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
