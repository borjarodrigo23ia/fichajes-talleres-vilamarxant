'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error('Segment Error:', error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Error al cargar contenido</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                No pudimos cargar esta sección correctamente.
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs"
            >
                <RefreshCw size={14} />
                Reintentar
            </button>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 max-w-md w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-left">
                    <p className="text-xs font-mono text-orange-800 break-words">
                        {error.message}
                    </p>
                </div>
            )}
        </div>
    );
}
