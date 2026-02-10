import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string; action: string }> }
) {
    const params = await props.params;
    const { id, action } = params;

    // Map 'accept' to 'approve' for backend compatibility
    const backendAction = action === 'accept' ? 'approve' : 'reject';

    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    try {
        const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections/${id}/${backendAction}`, {
            method: 'POST',
            headers: { 'DOLAPIKEY': apiKey }
        });

        const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }));

        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
