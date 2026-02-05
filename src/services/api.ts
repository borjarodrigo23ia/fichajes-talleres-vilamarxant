const BASE_URL = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;

let serverTimeOffset = 0;

export interface DolibarrResponse<T> {
    success?: {
        code: number;
        message: string;
    };
    error?: {
        code: number;
        message: string;
    };
    // Dolibarr sometimes returns the data directly or wrapped
    [key: string]: any;
}

export function setServerTimeOffset(offset: number) {
    serverTimeOffset = offset;
}

export function getServerTimeOffset() {
    return serverTimeOffset;
}

export async function dolibarrRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!BASE_URL) {
        throw new Error('NEXT_PUBLIC_DOLIBARR_API_URL is not defined');
    }

    // Remove leading slash if present in endpoint and trailing slash in BASE_URL if handled (skipped for simplicity, assuming consistent usage)
    const url = `${BASE_URL}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('dolibarr_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'DOLAPIKEY': token } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Update server time offset from Date header if present or custom header
        let serverTime: number | null = null;
        const serverDateHeader = response.headers.get('Date');

        if (serverDateHeader) {
            serverTime = new Date(serverDateHeader).getTime();
        }

        if (!response.ok) {
            // Try to parse error message
            let errorMessage = response.statusText;
            try {
                const errorBody = await response.json();
                if (errorBody.error && errorBody.error.message) {
                    errorMessage = errorBody.error.message;
                } else if (errorBody.message) {
                    errorMessage = errorBody.message;
                }
            } catch (e) {
                // ignore JSON parse error
            }
            throw new Error(errorMessage || `API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check if response body has a timestamp (new method)
        if (data && typeof data === 'object' && 'timestamp' in data && typeof data.timestamp === 'number') {
            serverTime = data.timestamp * 1000; // PHP returns seconds, JS uses ms
        }

        if (serverTime) {
            const clientTime = Date.now();
            serverTimeOffset = serverTime - clientTime;
            // console.log('[API] Sync:', { serverTime, clientTime, serverTimeOffset });
        } else if (!serverDateHeader) {
            console.log('[API] No Date header or timestamp found');
        }

        return data;
    } catch (error) {
        console.error('Dolibarr API request failed:', error);
        throw error;
    }
}
