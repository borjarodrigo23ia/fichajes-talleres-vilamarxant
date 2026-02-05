import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    console.log('[Approve] Approving correction ID:', params.id);

    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
    const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections/${params.id}/approve`, {
        method: 'POST',
        headers: { 'DOLAPIKEY': apiKey }
    });

    const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }));
    console.log('[Approve] Dolibarr response:', res.status, data);

    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
}
