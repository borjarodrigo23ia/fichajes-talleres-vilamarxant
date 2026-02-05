import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
    const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/userconfig/${id}`, {
        headers: { 'DOLAPIKEY': apiKey },
        cache: 'no-store'
    });

    if (!res.ok) return NextResponse.json({ error: 'Error' }, { status: res.status });
    return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json(); // { param_name, value }
    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    // We send individual updates as the API currently supports one by one, or update the API to support bulk? 
    // The API `setUserConfig` takes param_name and value.
    // If we want to save multiple, we'll do it in parallel or loop in the frontend/proxy.
    // Let's assume the frontend sends one by one or we proxy one by one.
    // But usually forms submit all. 
    // Ideally update backend to accept array. But for now let's support single update or loop.
    // Let's implement the proxy as single update pass-through for now.

    const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/users/${id}/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'DOLAPIKEY': apiKey
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) return NextResponse.json({ error: 'Error' }, { status: res.status });
    return NextResponse.json(await res.json());
}
