import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    // Use URLSearchParams to properly encode parameters
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('user_id', userId);

    try {
        const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/jornadas?${queryParams.toString()}`, {
            headers: { 'DOLAPIKEY': apiKey }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Backend error:', res.status, errorText);

            // Handle 404 specially - if no shifts found, return empty array instead of 404
            if (res.status === 404) {
                return NextResponse.json([]);
            }
            return NextResponse.json({ error: 'Error fetching shifts', details: errorText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    try {
        const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/jornadas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DOLAPIKEY': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: 'Error creating shift', details: errorText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
