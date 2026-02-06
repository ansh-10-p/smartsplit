import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Loader2 } from "lucide-react";

export function Toast({ message, type = "info", onClose, index = 0 }) {
    const config = {
        success: {
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-green-600",
            borderColor: "border-emerald-400/50",
        },
        error: {
            icon: AlertCircle,
            gradient: "from-red-500 to-rose-600",
            borderColor: "border-red-400/50",
        },
        warning: {
            icon: AlertTriangle,
            gradient: "from-amber-500 to-orange-600",
            borderColor: "border-amber-400/50",
        },
        info: {
            icon: Info,
            gradient: "from-blue-500 to-cyan-600",
            borderColor: "border-blue-400/50",
        },
        loading: {
            icon: Loader2,
            gradient: "from-purple-500 to-purple-600",
            borderColor: "border-purple-400/50",
        },
    };

    const { icon: Icon, gradient, borderColor } = config[type] || config.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ marginBottom: index * 80 }}
            className="pointer-events-auto"
        >
            <div
                className={`relative overflow-hidden rounded-xl border ${borderColor} backdrop-blur-xl bg-white/10 dark:bg-slate-900/10 shadow-2xl min-w-[320px] max-w-md`}
            >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90`} />

                {/* Content */}
                <div className="relative flex items-start gap-3 p-4 pr-12">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: 1,
                            rotate: type === "loading" ? 360 : 0
                        }}
                        transition={{
                            delay: 0.1,
                            type: "spring",
                            stiffness: 500,
                            rotate: type === "loading" ? {
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                            } : {}
                        }}
                        className="flex-shrink-0"
                    >
                        <div className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                    </motion.div>

                    <p className="text-sm font-medium text-white leading-relaxed pt-0.5">
                        {message}
                    </p>

                    {type !== "loading" && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </motion.button>
                    )}
                </div>

                {/* Progress bar - only for non-loading toasts */}
                {type !== "loading" && (
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 3.5, ease: "linear" }}
                        className="h-1 bg-white/30 origin-left"
                    />
                )}
            </div>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col-reverse gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast, index) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        index={index}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
