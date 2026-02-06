import React from "react";
import { motion } from "framer-motion";

/**
 * Skeleton Loader Components
 * Display loading states that match actual component layouts
 */

// Base skeleton with shimmer animation
const SkeletonBase = ({ className = "", ...props }) => (
    <div
        className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:200%_100%] rounded ${className}`}
        style={{
            animation: "shimmer 2s infinite",
        }}
        {...props}
    />
);

// Card Skeleton - For stat cards
export function CardSkeleton({ count = 1 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="border rounded-lg p-6 bg-white dark:bg-slate-900"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <SkeletonBase className="h-4 w-24 mb-3" />
                            <SkeletonBase className="h-8 w-32" />
                        </div>
                        <SkeletonBase className="h-12 w-12 rounded-xl" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// List Skeleton - For expense/transaction lists
export function ListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-slate-900"
                >
                    <div className="flex gap-3 flex-1">
                        <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <SkeletonBase className="h-4 w-3/4" />
                            <SkeletonBase className="h-3 w-1/2" />
                            <div className="flex gap-2 mt-2">
                                <SkeletonBase className="h-5 w-16 rounded-full" />
                                <SkeletonBase className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <SkeletonBase className="h-6 w-20" />
                </motion.div>
            ))}
        </div>
    );
}

// Chart Skeleton - For analytics charts
export function ChartSkeleton({ height = "300px" }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border rounded-lg p-6 bg-white dark:bg-slate-900"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <SkeletonBase className="h-6 w-32" />
                    <SkeletonBase className="h-8 w-24 rounded-lg" />
                </div>
                <SkeletonBase className="h-3 w-48" />
                <div className="relative" style={{ height }}>
                    {/* Chart bars */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 h-full">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <SkeletonBase
                                key={i}
                                className="flex-1"
                                style={{ height: `${Math.random() * 60 + 40}%` }}
                            />
                        ))}
                    </div>
                </div>
                {/* X-axis labels */}
                <div className="flex justify-around">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <SkeletonBase key={i} className="h-3 w-8" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Table Skeleton - For data tables
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900"
        >
            {/* Header */}
            <div className="border-b bg-slate-50 dark:bg-slate-800 p-4">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <SkeletonBase key={i} className="h-4 flex-1" />
                    ))}
                </div>
            </div>
            {/* Rows */}
            <div className="divide-y">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="flex gap-4">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <SkeletonBase key={colIndex} className="h-4 flex-1" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// Profile Skeleton - For profile page
export function ProfileSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Cover and Avatar */}
            <div className="relative">
                <SkeletonBase className="h-48 w-full rounded-t-lg" />
                <div className="absolute -bottom-12 left-8">
                    <SkeletonBase className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900" />
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 px-8 space-y-4">
                <SkeletonBase className="h-8 w-48" />
                <SkeletonBase className="h-4 w-64" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="text-center space-y-2">
                            <SkeletonBase className="h-8 w-16 mx-auto" />
                            <SkeletonBase className="h-3 w-20 mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-3 pt-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <SkeletonBase className="h-4 w-24" />
                            <SkeletonBase className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Notification Skeleton - For notification cards
export function NotificationSkeleton({ count = 5 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 border rounded-lg bg-white dark:bg-slate-900"
                >
                    <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonBase className="h-4 w-3/4" />
                        <SkeletonBase className="h-3 w-1/2" />
                        <SkeletonBase className="h-3 w-1/4" />
                    </div>
                    <SkeletonBase className="h-8 w-8 rounded" />
                </motion.div>
            ))}
        </div>
    );
}

// Add shimmer animation to global styles
if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
    document.head.appendChild(style);
}

export default {
    CardSkeleton,
    ListSkeleton,
    ChartSkeleton,
    TableSkeleton,
    ProfileSkeleton,
    NotificationSkeleton,
};
