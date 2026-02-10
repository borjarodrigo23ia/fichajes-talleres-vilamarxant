import webPush from 'web-push';
import { getSubscriptionsForUser, getAllSubscriptions, PushSubscription } from '@/lib/push-db';

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured');
} else {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
}

export async function sendPushNotification(userId: string, payload: NotificationPayload) {
    const subscriptions = getSubscriptionsForUser(userId);

    if (subscriptions.length === 0) return { success: false, sent: 0 };

    let sentCount = 0;
    const errors = [];

    for (const sub of subscriptions) {
        try {
            await webPush.sendNotification(
                sub as any, // web-push types might differ slightly but structure matches
                JSON.stringify(payload)
            );
            sentCount++;
        } catch (error: any) {
            console.error('Error sending push:', error);
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription expired/gone - ideally remove from DB here
            }
            errors.push(error);
        }
    }

    return { success: true, sent: sentCount, total: subscriptions.length };
}

export async function sendPushNotificationToAdmin(payload: NotificationPayload) {
    // TODO: Determine how to identify admins. 
    // For now, we might notify specific users or all users with 'admin' flag if we stored it.
    // Since we don't store admin status in push-db, we might need to fetch it or rely on a hardcoded list/env var.
    // Fallback: Notify NO ONE for now unless we implementation admin ID discovery.
    // Or we could fetch logic from Dolibarr.
    console.warn("sendPushNotificationToAdmin not fully implemented without admin user discovery");
    return { success: false };
}
