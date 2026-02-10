import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Skeleton width="12rem" height="1.5rem" className="mb-2" />
                    <Skeleton width="20rem" height="2.5rem" />
                </div>
                <Skeleton width="10rem" height="3rem" borderRadius="1.4rem" />
            </div>

            {/* TimerCard Skeleton */}
            <div className="w-full h-[400px] md:h-[500px] bg-white/80 rounded-[2.5rem] p-8 border border-white/20 shadow-sm relative overflow-hidden">
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    <Skeleton width="8rem" height="2rem" borderRadius="full" />
                    <Skeleton width="16rem" height="5rem" />
                    <div className="w-full max-w-md">
                        <Skeleton width="100%" height="4rem" borderRadius="1rem" />
                    </div>
                </div>
            </div>

            {/* TodayFichajes Skeleton */}
            <div className="w-full h-64 bg-white/80 rounded-[2.5rem] p-8 border border-white/20 shadow-sm">
                <div className="flex justify-between mb-8">
                    <Skeleton width="10rem" height="2rem" />
                    <Skeleton width="4rem" height="1.5rem" borderRadius="full" />
                </div>
                <div className="space-y-4">
                    <Skeleton width="100%" height="3rem" />
                    <Skeleton width="100%" height="3rem" />
                </div>
            </div>
        </div>
    );
}
