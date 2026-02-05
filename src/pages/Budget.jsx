import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Plus,
    Edit2,
    Trash2,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Calendar,
    PieChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NumberFlow from "@number-flow/react";

const BUDGET_KEY = "smartsplit_budgets_v1";
const EXP_KEY = "smartsplit_expenses_v1";

const categories = [
    { id: "food", name: "🍔 Food & Dining", color: "#10b981" },
    { id: "transport", name: "🚗 Transportation", color: "#3b82f6" },
    { id: "entertainment", name: "🎬 Entertainment", color: "#ec4899" },
    { id: "shopping", name: "🛍️ Shopping", color: "#f59e0b" },
    { id: "utilities", name: "💡 Utilities", color: "#8b5cf6" },
    { id: "health", name: "🏥 Healthcare", color: "#ef4444" },
    { id: "other", name: "📦 Other", color: "#6b7280" },
];

export default function Budget() {
    const [budgets, setBudgets] = useState(() => {
        const saved = localStorage.getItem(BUDGET_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [isCreating, setIsCreating] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: "",
        amount: "",
        period: "monthly",
    });

    const expenses = JSON.parse(localStorage.getItem(EXP_KEY) || "[]");

    const saveBudgets = (newBudgets) => {
        setBudgets(newBudgets);
        localStorage.setItem(BUDGET_KEY, JSON.stringify(newBudgets));
    };

    const handleCreate = () => {
        if (!newBudget.category || !newBudget.amount) return;

        const budget = {
            id: Date.now().toString(),
            ...newBudget,
            amount: parseFloat(newBudget.amount),
            createdAt: new Date().toISOString(),
        };

        saveBudgets([...budgets, budget]);
        setNewBudget({ category: "", amount: "", period: "monthly" });
        setIsCreating(false);
    };

    const handleDelete = (id) => {
        saveBudgets(budgets.filter((b) => b.id !== id));
    };

    // Calculate spending per category
    const categorySpending = useMemo(() => {
        const spending = {};
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        expenses.forEach((exp) => {
            const expDate = new Date(exp.date);
            if (expDate >= monthStart) {
                const cat = exp.category?.toLowerCase() || "other";
                spending[cat] = (spending[cat] || 0) + parseFloat(exp.amount || 0);
            }
        });

        return spending;
    }, [expenses]);

    // Calculate budget status
    const budgetStatus = budgets.map((budget) => {
        const spent = categorySpending[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;
        const remaining = budget.amount - spent;

        return {
            ...budget,
            spent,
            percentage: Math.min(percentage, 100),
            remaining,
            status:
                percentage >= 100
                    ? "exceeded"
                    : percentage >= 80
                        ? "warning"
                        : "good",
        };
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    const totalRemaining = totalBudget - totalSpent;

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
                            <Target className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                            Budget Planner
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
                            Set budgets and track your spending to achieve your financial goals
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                ₹<NumberFlow value={totalBudget} format={{ notation: "compact" }} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                            <TrendingUp className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                ₹<NumberFlow value={totalSpent} format={{ notation: "compact" }} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${totalRemaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                ₹<NumberFlow value={Math.abs(totalRemaining)} format={{ notation: "compact" }} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {totalRemaining >= 0 ? "Under budget" : "Over budget"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Create Budget Button */}
                {!isCreating && (
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                        size="lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Budget
                    </Button>
                )}

                {/* Create Budget Form */}
                {isCreating && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-purple-200 dark:border-purple-700 shadow-lg">
                            <CardHeader>
                                <CardTitle>Create New Budget</CardTitle>
                                <CardDescription>Set a spending limit for a category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select
                                            id="category"
                                            value={newBudget.category}
                                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Budget Amount (₹)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="5000"
                                            value={newBudget.amount}
                                            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                                        Create Budget
                                    </Button>
                                    <Button onClick={() => setIsCreating(false)} variant="outline">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Budget List */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Your Budgets</h2>
                    {budgetStatus.length === 0 ? (
                        <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <Target className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No Budgets Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first budget to start tracking your spending
                                </p>
                                <Button
                                    onClick={() => setIsCreating(true)}
                                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Budget
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        budgetStatus.map((budget, index) => {
                            const category = categories.find((c) => c.id === budget.category);
                            return (
                                <motion.div
                                    key={budget.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                                        style={{ backgroundColor: `${category?.color}20` }}
                                                    >
                                                        {category?.name.split(" ")[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{category?.name}</h3>
                                                        <p className="text-sm text-muted-foreground capitalize">{budget.period} budget</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {budget.status === "exceeded" && (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Over Budget
                                                        </Badge>
                                                    )}
                                                    {budget.status === "warning" && (
                                                        <Badge className="bg-orange-600 gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Warning
                                                        </Badge>
                                                    )}
                                                    {budget.status === "good" && (
                                                        <Badge className="bg-green-600 gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            On Track
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(budget.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Spent</span>
                                                    <span className="font-semibold">
                                                        ₹{budget.spent.toFixed(0)} / ₹{budget.amount.toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all ${budget.status === "exceeded"
                                                                ? "bg-red-600"
                                                                : budget.status === "warning"
                                                                    ? "bg-orange-600"
                                                                    : "bg-green-600"
                                                            }`}
                                                        style={{ width: `${budget.percentage}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Remaining</span>
                                                    <span className={`font-semibold ${budget.remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        ₹{Math.abs(budget.remaining).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
