import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const formData = await request.formData();
        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        // Note: The frontend appends /logo or /logo-squarred but we can handle it here or in subfolders
        // For simplicity, let's look at the URL to see if it's squarred
        const isSquarred = request.url.includes('logo-squarred');
        const endpoint = isSquarred ? '/setupempresaapi/logo-squarred' : '/setupempresaapi/logo';

        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'DOLAPIKEY': apiKey
            },
            body: formData
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Error al subir logo a Dolibarr' },
                { status: response.status }
            );
        }

        return NextResponse.json(await response.json());

    } catch (error: any) {
        console.error('API SetupEmpresa Logo Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const apiKey = request.headers.get('DOLAPIKEY');
        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const isSquarred = request.url.includes('logo-squarred');
        const endpoint = isSquarred ? '/setupempresaapi/logo-squarred' : '/setupempresaapi/logo';

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'DOLAPIKEY': apiKey
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Error al borrar logo en Dolibarr' },
                { status: response.status }
            );
        }

        return NextResponse.json(await response.json());

    } catch (error: any) {
        console.error('API SetupEmpresa Logo Delete Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const apiKey = request.headers.get('DOLAPIKEY') || searchParams.get('token');
        const filename = searchParams.get('file');

        if (!apiKey) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (!filename) {
            return NextResponse.json({ error: 'Fichero no especificado' }, { status: 400 });
        }

        const apiUrl = process.env.NEXT_PUBLIC_DOLIBARR_API_URL;
        if (!apiUrl) throw new Error('Dolibarr API URL not configured');

        // Fetch document from Dolibarr
        // GET /documents/download?modulepart=mycompany&file=logos/{filename}
        const response = await fetch(`${apiUrl}/documents/download?modulepart=mycompany&file=logos/${filename}`, {
            headers: {
                'DOLAPIKEY': apiKey
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Error al descargar logo de Dolibarr' },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error: any) {
        console.error('API SetupEmpresa Logo GET Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
