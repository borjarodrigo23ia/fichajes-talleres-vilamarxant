import { NextRequest, NextResponse } from 'next/server';
import { getReadNotifications, markAsRead } from '@/lib/notification-db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const readIds = getReadNotifications(userId);
    return NextResponse.json(readIds);
}

export async function POST(request: NextRequest) {
    try {
        const { userId, notificationIds } = await request.json();

        if (!userId || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        markAsRead(userId, notificationIds);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
