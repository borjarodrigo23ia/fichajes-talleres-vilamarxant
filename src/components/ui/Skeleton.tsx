'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    borderRadius,
}) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 ${className}`}
            style={{
                width: width ?? '100%',
                height: height ?? '1rem',
                borderRadius: borderRadius ?? '0.5rem',
            }}
        />
    );
};
