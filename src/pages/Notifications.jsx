import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Check,
    X,
    Trash2,
    Filter,
    DollarSign,
    Users,
    Calendar,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const NOTIF_KEY = "smartsplit_notifications_v1";

// Generate sample notifications
const generateNotifications = () => {
    const saved = localStorage.getItem(NOTIF_KEY);
    if (saved) return JSON.parse(saved);

    const notifications = [
        {
            id: "1",
            type: "payment",
            title: "Payment Reminder",
            message: "You owe ₹500 to Raj for Dinner",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
        },
        {
            id: "2",
            type: "group",
            title: "New Group Invitation",
            message: "Priya invited you to join 'Weekend Trip' group",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: false,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            id: "3",
            type: "expense",
            title: "New Expense Added",
            message: "Amit added ₹1,200 for 'Movie Night' in Friends group",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            icon: Calendar,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            id: "4",
            type: "settlement",
            title: "Settlement Completed",
            message: "Neha marked your payment of ₹800 as settled",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
        },
        {
            id: "5",
            type: "reminder",
            title: "Pending Settlements",
            message: "You have 3 pending settlements totaling ₹2,400",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
        },
    ];

    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
    return notifications;
};

export default function Notifications() {
    const [notifications, setNotifications] = useState(generateNotifications);
    const [filter, setFilter] = useState("all"); // all, unread, payment, group, expense

    const saveNotifications = (newNotifications) => {
        setNotifications(newNotifications);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(newNotifications));
    };

    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread") return notifications.filter((n) => !n.read);
        return notifications.filter((n) => n.type === filter);
    }, [notifications, filter]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id) => {
        const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        saveNotifications(updated);
    };

    const deleteNotification = (id) => {
        const updated = notifications.filter((n) => n.id !== id);
        saveNotifications(updated);
    };

    const deleteAll = () => {
        saveNotifications([]);
    };

    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const filters = [
        { id: "all", label: "All", count: notifications.length },
        { id: "unread", label: "Unread", count: unreadCount },
        { id: "payment", label: "Payments", count: notifications.filter((n) => n.type === "payment").length },
        { id: "group", label: "Groups", count: notifications.filter((n) => n.type === "group").length },
        { id: "expense", label: "Expenses", count: notifications.filter((n) => n.type === "expense").length },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 sm:py-20 mb-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                                    Notifications
                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light mt-2">
                                    Stay updated with your expenses and payments
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                                    {unreadCount} Unread
                                </Badge>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-6">
                {/* Actions Bar */}
                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2 flex-wrap">
                                {filters.map((f) => (
                                    <Button
                                        key={f.id}
                                        variant={filter === f.id ? "default" : "outline"}
                                        onClick={() => setFilter(f.id)}
                                        className={
                                            filter === f.id
                                                ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                                                : ""
                                        }
                                    >
                                        {f.label}
                                        {f.count > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {f.count}
                                            </Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <Button onClick={markAllAsRead} variant="outline">
                                        <Check className="w-4 h-4 mr-2" />
                                        Mark All Read
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button onClick={deleteAll} variant="outline" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                                <CardContent className="py-16 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <Bell className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                                    <p className="text-muted-foreground">
                                        {filter === "all"
                                            ? "You're all caught up! No notifications to show."
                                            : `No ${filter} notifications found.`}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <Card
                                        className={`border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all ${!notif.read ? "border-l-4 border-l-purple-600" : ""
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-full ${notif.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                    <notif.icon className={`w-6 h-6 ${notif.color}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <h3 className={`font-semibold ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                                                                {notif.title}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                                                            <p className="text-xs text-muted-foreground mt-2">{getRelativeTime(notif.timestamp)}</p>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-2" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {!notif.read && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => deleteNotification(notif.id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
