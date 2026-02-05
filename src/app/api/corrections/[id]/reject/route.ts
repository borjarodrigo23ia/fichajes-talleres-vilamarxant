import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
    const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections/${params.id}/reject`, {
        method: 'POST',
        headers: { 'DOLAPIKEY': apiKey }
    });

    if (!res.ok) return NextResponse.json({ error: 'Error' }, { status: res.status });
    return NextResponse.json(await res.json());
}
