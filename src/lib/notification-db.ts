import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const READ_NOTIFICATIONS_FILE = path.join(DATA_DIR, 'read_notifications.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getReadNotifications(userId: string): string[] {
    if (!fs.existsSync(READ_NOTIFICATIONS_FILE)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(READ_NOTIFICATIONS_FILE, 'utf-8'));
        return data[userId] || [];
    } catch (e) {
        return [];
    }
}

export function markAsRead(userId: string, notificationIds: string[]) {
    let data: Record<string, string[]> = {};
    if (fs.existsSync(READ_NOTIFICATIONS_FILE)) {
        try {
            data = JSON.parse(fs.readFileSync(READ_NOTIFICATIONS_FILE, 'utf-8'));
        } catch (e) {
            data = {};
        }
    }

    const currentRead = data[userId] || [];
    // Add new IDs and remove duplicates
    const updatedRead = Array.from(new Set([...currentRead, ...notificationIds]));

    data[userId] = updatedRead;

    fs.writeFileSync(READ_NOTIFICATIONS_FILE, JSON.stringify(data, null, 2));
}
