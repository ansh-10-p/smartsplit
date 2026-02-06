import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    PieChart,
    BarChart3,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Users,
    Receipt,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPie,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NumberFlow from "@number-flow/react";

const EXP_KEY = "smartsplit_expenses_v1";
const INC_KEY = "smartsplit_incomes_v1";

// Utility functions
const load = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

export default function Analytics() {
    const [timeRange, setTimeRange] = useState("month"); // week, month, year, all
    const expenses = load(EXP_KEY, []);
    const incomes = load(INC_KEY, []);

    // Calculate date range
    const getDateRange = () => {
        const now = new Date();
        const ranges = {
            week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
            all: new Date(0),
        };
        return ranges[timeRange];
    };

    // Filter data by time range
    const filteredExpenses = useMemo(() => {
        const startDate = getDateRange();
        return expenses.filter((exp) => new Date(exp.date) >= startDate);
    }, [expenses, timeRange]);

    const filteredIncomes = useMemo(() => {
        const startDate = getDateRange();
        return incomes.filter((inc) => new Date(inc.date) >= startDate);
    }, [incomes, timeRange]);

    // Calculate totals
    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalIncome = filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    // Category breakdown
    const categoryData = useMemo(() => {
        const categories = {};
        filteredExpenses.forEach((exp) => {
            const cat = exp.category || "Other";
            categories[cat] = (categories[cat] || 0) + parseFloat(exp.amount || 0);
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    // Monthly trend data
    const monthlyTrend = useMemo(() => {
        const months = {};
        [...filteredExpenses, ...filteredIncomes].forEach((item) => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!months[monthKey]) {
                months[monthKey] = { month: monthKey, expense: 0, income: 0 };
            }
            if (filteredExpenses.includes(item)) {
                months[monthKey].expense += parseFloat(item.amount || 0);
            } else {
                months[monthKey].income += parseFloat(item.amount || 0);
            }
        });
        return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
    }, [filteredExpenses, filteredIncomes]);

    // Top spending categories
    const topCategories = categoryData.slice(0, 5);

    // Average daily spending
    const daysInRange = Math.max(
        1,
        Math.ceil((new Date() - getDateRange()) / (1000 * 60 * 60 * 24))
    );
    const avgDailySpending = totalExpense / daysInRange;

    // Comparison with previous period
    const getPreviousPeriodData = () => {
        const now = new Date();
        const currentStart = getDateRange();
        const periodLength = now - currentStart;
        const previousStart = new Date(currentStart.getTime() - periodLength);
        const previousEnd = currentStart;

        const prevExpenses = expenses.filter((exp) => {
            const date = new Date(exp.date);
            return date >= previousStart && date < previousEnd;
        });

        return prevExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    };

    const previousPeriodTotal = getPreviousPeriodData();
    const changePercent =
        previousPeriodTotal > 0
            ? (((totalExpense - previousPeriodTotal) / previousPeriodTotal) * 100).toFixed(1)
            : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 sm:py-20 mb-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                            Analytics & Insights
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
                            Deep dive into your spending patterns and financial health
                        </p>
                    </motion.div>

                    {/* Time Range Selector */}
                    <div className="mt-8 flex gap-2 flex-wrap">
                        {["week", "month", "year", "all"].map((range) => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "secondary"}
                                onClick={() => setTimeRange(range)}
                                className={
                                    timeRange === range
                                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                                        : ""
                                }
                            >
                                {range === "all" ? "All Time" : `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                    >
                        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                                <motion.div
                                    className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Receipt className="h-4 w-4 text-white" />
                                </motion.div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                    ₹<NumberFlow value={totalExpense} format={{ notation: "compact" }} />
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                    {changePercent > 0 ? (
                                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className={changePercent > 0 ? "text-red-500" : "text-green-500"}>
                                        {Math.abs(changePercent)}%
                                    </span>
                                    <span className="text-muted-foreground">vs previous period</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                    >
                        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                                <motion.div
                                    className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </motion.div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                    ₹<NumberFlow value={totalIncome} format={{ notation: "compact" }} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {filteredIncomes.length} income sources
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                    >
                        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                                <motion.div
                                    className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Wallet className="h-4 w-4 text-white" />
                                </motion.div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className={`text-4xl font-bold ${netBalance >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent" : "bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"}`}>
                                    ₹<NumberFlow value={netBalance} format={{ notation: "compact" }} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {savingsRate}% savings rate
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                    >
                        <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily Spending</CardTitle>
                                <motion.div
                                    className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Calendar className="h-4 w-4 text-white" />
                                </motion.div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    ₹<NumberFlow value={avgDailySpending} format={{ notation: "compact", maximumFractionDigits: 0 }} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {filteredExpenses.length} transactions
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trend */}
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <CardTitle>Income vs Expenses Trend</CardTitle>
                            <CardDescription>Track your financial flow over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category Breakdown Pie */}
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <CardTitle>Spending by Category</CardTitle>
                            <CardDescription>Where your money goes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPie>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Categories */}
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <CardHeader>
                        <CardTitle>Top Spending Categories</CardTitle>
                        <CardDescription>Your biggest expense areas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCategories.map((cat, index) => {
                                const percentage = ((cat.value / totalExpense) * 100).toFixed(1);
                                return (
                                    <motion.div
                                        key={cat.name}
                                        className="space-y-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="w-4 h-4 rounded-full shadow-md"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    whileHover={{ scale: 1.3, rotate: 180 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                                <span className="font-medium">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground font-semibold">{percentage}%</span>
                                                <span className="font-bold text-lg">₹{cat.value.toFixed(0)}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                className="h-2.5 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Insights */}
                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            AI Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {netBalance > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Badge className="bg-green-600 mt-1">Good</Badge>
                                <p className="text-sm">
                                    Great job! You're saving {savingsRate}% of your income. Keep up the good work!
                                </p>
                            </div>
                        )}
                        {topCategories.length > 0 && topCategories[0].value / totalExpense > 0.4 && (
                            <div className="flex items-start gap-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <Badge className="bg-yellow-600 mt-1">Tip</Badge>
                                <p className="text-sm">
                                    {topCategories[0].name} accounts for {((topCategories[0].value / totalExpense) * 100).toFixed(0)}% of
                                    your spending. Consider setting a budget for this category.
                                </p>
                            </div>
                        )}
                        {changePercent > 20 && (
                            <div className="flex items-start gap-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Badge className="bg-red-600 mt-1">Alert</Badge>
                                <p className="text-sm">
                                    Your spending increased by {changePercent}% compared to the previous period. Review your recent expenses.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
