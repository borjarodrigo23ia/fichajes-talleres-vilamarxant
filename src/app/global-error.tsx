'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Ha ocurrido un error crítico en la aplicación. Por favor, intenta recargar la página.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => reset()}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-xl text-left overflow-auto max-h-40">
                            <p className="text-xs font-mono text-red-600 break-all">
                                {error.message}
                            </p>
                            <p className="text-[10px] font-mono text-gray-400 mt-2">
                                Digest: {error.digest}
                            </p>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
