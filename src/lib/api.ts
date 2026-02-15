export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('dolibarr_token') : '';

    // Normalize endpoint to ensuring it starts with /api/index.php if not already absolute or relative
    // Users might pass '/setupempresa/' or full URL.
    // We'll trust the user passes the path relative to API root if it starts with /

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/index.php';
    let url = endpoint;

    // If endpoint doesn't start with http, prepend API URL
    if (!endpoint.startsWith('http')) {
        // Ensure endpoint starts with slash if not empty
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        url = `${apiUrl}${path}`;
    }

    const headers: Record<string, string> = {
        'DOLAPIKEY': token || '',
        ...(options.headers as Record<string, string>),
    };

    // Auto-set Content-Type to JSON if body is string and not specified
    if (typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        // Handle 401 specifically if needed (e.g. redirect to login)
        if (response.status === 401) {
            console.warn('Unauthorized access - token might be invalid/expired');
        }

        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`);
    }

    // Return JSON by default
    // If response is empty (204), return null
    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch {
        // If not JSON, return text or null
        return null;
    }
}
