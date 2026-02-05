import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/config/logout-after-clock
 * Returns the logout-after-clock configuration for the application.
 * For now, this returns a default configuration (enabled: false).
 * This can be extended to read from environment variables or database.
 */
export async function GET(request: NextRequest) {
    try {
        // Default configuration - can be overridden by environment variables
        const enabled = process.env.LOGOUT_AFTER_CLOCK_ENABLED === 'true' || false;

        return NextResponse.json({
            enabled,
        });
    } catch (error) {
        console.error('Error fetching logout-after-clock config:', error);
        return NextResponse.json(
            { error: 'Error fetching logout-after-clock config' },
            { status: 500 }
        );
    }
}
