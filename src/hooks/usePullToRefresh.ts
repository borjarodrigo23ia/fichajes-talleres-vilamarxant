'use client';

import { useState, useCallback, useEffect } from 'react';

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
    const [pullProgress, setPullProgress] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    const pullThreshold = 80; // Pixels to pull down to trigger refresh

    const handleTouchStart = (e: TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (startY === 0 || window.scrollY > 0 || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;

        if (diff > 0) {
            // Logarithmic pull for a natural feel
            const progress = Math.min(diff / 2, pullThreshold * 1.5);
            setPullProgress(progress);

            // Prevent default scrolling when pulling
            if (diff > 10) {
                if (e.cancelable) e.preventDefault();
            }
        }
    };

    const handleTouchEnd = useCallback(async () => {
        if (pullProgress >= pullThreshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullProgress(pullThreshold);

            try {
                // Short delay to show animation
                await new Promise(r => setTimeout(r, 400));
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullProgress(0);
            }
        } else {
            setPullProgress(0);
        }
        setStartY(0);
    }, [pullProgress, isRefreshing, onRefresh]);

    useEffect(() => {
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchEnd, startY, isRefreshing]);

    return { pullProgress, isRefreshing };
};
