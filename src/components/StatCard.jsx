import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    description,
    gradient = "from-purple-500 to-purple-600",
    accentColor = "purple",
    delay = 0,
    prefix = "₹",
    suffix = "",
    variant = "default",
}) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend === "up") return TrendingUp;
        if (trend === "down") return TrendingDown;
        return Minus;
    };

    const getTrendColor = () => {
        if (trend === "up") return "text-green-600 dark:text-green-400";
        if (trend === "down") return "text-red-600 dark:text-red-400";
        return "text-slate-600 dark:text-slate-400";
    };

    const TrendIcon = getTrendIcon();

    const colorSchemes = {
        purple: {
            gradient: "from-purple-500 to-purple-600",
            accent: "from-purple-600 to-cyan-600",
            iconBg: "from-purple-500 to-purple-600",
            lightBg: "bg-purple-50 dark:bg-purple-950/30",
            border: "border-purple-200/50 dark:border-purple-800/50",
        },
        orange: {
            gradient: "from-orange-500 to-orange-600",
            accent: "from-orange-500 to-red-500",
            iconBg: "from-orange-500 to-orange-600",
            lightBg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200/50 dark:border-orange-800/50",
        },
        green: {
            gradient: "from-green-500 to-green-600",
            accent: "from-green-500 to-emerald-500",
            iconBg: "from-green-500 to-green-600",
            lightBg: "bg-green-50 dark:bg-green-950/30",
            border: "border-green-200/50 dark:border-green-800/50",
        },
        blue: {
            gradient: "from-blue-500 to-blue-600",
            accent: "from-blue-500 to-cyan-500",
            iconBg: "from-blue-500 to-blue-600",
            lightBg: "bg-blue-50 dark:bg-blue-950/30",
            border: "border-blue-200/50 dark:border-blue-800/50",
        },
    };

    const colors = colorSchemes[accentColor] || colorSchemes.purple;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
            className="h-full"
        >
            <Card className={cn(
                "relative overflow-hidden h-full transition-all duration-300",
                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                "hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50",
                "group"
            )}>
                {/* Gradient accent line at top */}
                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", colors.gradient)} />

                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                {title}
                            </p>
                            {description && (
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Icon */}
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className={cn(
                                "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                colors.iconBg
                            )}
                        >
                            <Icon className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>

                    {/* Value */}
                    <div className="space-y-2">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
                            className="flex items-baseline gap-2"
                        >
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {prefix}
                                <NumberFlow value={value} />
                                {suffix}
                            </span>
                        </motion.div>

                        {/* Trend indicator */}
                        {TrendIcon && trendValue && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: delay + 0.3 }}
                                className="flex items-center gap-1.5"
                            >
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                    colors.lightBg,
                                    getTrendColor()
                                )}>
                                    <TrendIcon className="w-3 h-3" />
                                    <span>{trendValue}</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                    vs last month
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Bottom gradient line on hover */}
                    <motion.div
                        className={cn(
                            "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r origin-left",
                            colors.accent
                        )}
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
