import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, getSubscriptionsForUser } from '@/lib/push-db';

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('DOLAPIKEY');
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!apiKey || !userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subs = getSubscriptionsForUser(userId);
    return NextResponse.json(subs);
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        const userId = request.headers.get('X-User-Id'); // Ideally passed or extracted from token. 
        // For now we trust the client or could check session if implemented.
        // Better: decode user from session/context if available in backend, 
        // but here we rely on the client sending ID + valid API key as "auth"

        if (!apiKey || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await request.json();

        // Validate subscription object
        if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
            return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
        }

        saveSubscription(userId, subscription, request.headers.get('user-agent') || 'unknown');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
