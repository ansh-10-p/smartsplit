import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export function DashboardCard({
    title,
    value,
    icon: Icon,
    gradient = "from-purple-500 to-purple-600",
    accentGradient = "from-purple-600 to-cyan-600",
    delay = 0,
    prefix = "₹",
    suffix = "",
    description,
    trend,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ y: -4 }}
            className="h-full"
        >
            <Card className={cn(
                "relative overflow-hidden h-full min-h-[140px]",
                "bg-white dark:bg-slate-800",
                "border border-slate-200 dark:border-slate-700",
                "shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50",
                "hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70",
                "transition-all duration-300 group"
            )}>
                {/* Animated gradient overlay */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                    gradient
                )} />

                {/* Top accent bar */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                    gradient
                )} />

                <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                {title}
                            </p>
                            {description && (
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
                                    {description}
                                </p>
                            )}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: delay + 0.15, type: "spring", stiffness: 200 }}
                                className="flex items-baseline gap-1"
                            >
                                <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                                    {prefix}
                                    <NumberFlow value={value} />
                                    {suffix}
                                </span>
                            </motion.div>
                        </div>

                        {/* Icon */}
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                            className={cn(
                                "relative p-3 rounded-2xl bg-gradient-to-br shadow-lg",
                                gradient,
                                "flex-shrink-0"
                            )}
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 bg-white/20 rounded-2xl blur-md"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <Icon className="w-6 h-6 text-white relative z-10" />
                        </motion.div>
                    </div>

                    {/* Bottom accent line */}
                    <motion.div
                        className={cn(
                            "mt-4 h-0.5 rounded-full bg-gradient-to-r",
                            accentGradient,
                            "origin-left"
                        )}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: delay + 0.3, duration: 0.5 }}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}

