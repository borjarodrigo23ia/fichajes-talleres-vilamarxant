import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const apiKey = request.headers.get('DOLAPIKEY');
    if (!apiKey) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

    // 1. Fetch correction details to get the user ID
    let userId = '';
    try {
        const detailsRes = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections?id=${params.id}`, {
            headers: { 'DOLAPIKEY': apiKey }
        });
        if (detailsRes.ok) {
            const details = await detailsRes.json();
            if (Array.isArray(details) && details.length > 0) userId = details[0].fk_user;
            else if (details.fk_user) userId = details.fk_user;
        }
    } catch (e) {
        console.error('Error fetching correction details for notification:', e);
    }

    // 2. Perform Rejection
    const res = await fetch(`${apiUrl}/fichajestrabajadoresapi/corrections/${params.id}/reject`, {
        method: 'POST',
        headers: { 'DOLAPIKEY': apiKey }
    });

    if (!res.ok) return NextResponse.json({ error: 'Error' }, { status: res.status });
    const data = await res.json();

    // 3. Send Notification
    if (userId) {
        const { sendPushNotification } = await import('@/lib/push-sender');
        const { getUserPreferences } = await import('@/lib/push-db');

        const prefs = getUserPreferences(userId);
        if (prefs.cambios) {
            await sendPushNotification(userId, {
                title: 'Solicitud Rechazada',
                body: 'Tu solicitud de corrección de fichaje ha sido rechazada.',
                url: '/fichajes/historial'
            });
        }
    }

    return NextResponse.json(data);
}
