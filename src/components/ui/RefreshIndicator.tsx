'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshIndicatorProps {
    progress: number;
    isRefreshing: boolean;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ progress, isRefreshing }) => {
    if (progress <= 0 && !isRefreshing) return null;

    const pullThreshold = 80;
    const rotation = (progress / pullThreshold) * 360;
    const opacity = Math.min(progress / 40, 1);
    const scale = Math.min(0.5 + (progress / pullThreshold) * 0.5, 1);

    return (
        <div
            className="fixed top-2 left-0 right-0 z-[100] flex justify-center pointer-events-none"
            style={{
                transform: `translateY(${progress}px)`,
                opacity: opacity,
            }}
        >
            <div className={`bg-white p-3 rounded-full shadow-xl border border-gray-100 transition-transform ${isRefreshing ? 'animate-bounce' : ''}`}>
                <RefreshCw
                    size={24}
                    className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: !isRefreshing ? `rotate(${rotation}deg) scale(${scale})` : undefined }}
                />
            </div>
        </div>
    );
};
