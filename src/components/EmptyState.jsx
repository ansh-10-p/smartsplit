import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * EmptyState Component
 * Displays a friendly message when no data is available
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.title - Main heading
 * @param {string} props.description - Explanatory text
 * @param {React.ReactNode} props.action - Optional CTA button/element
 * @param {string} props.illustration - Optional custom illustration URL
 */
export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    illustration
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
        >
            {illustration ? (
                <img
                    src={illustration}
                    alt={title}
                    className="w-48 h-48 mb-6 opacity-80"
                />
            ) : Icon ? (
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
            ) : null}

            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                {title}
            </h3>

            <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {description}
            </p>

            {action && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
}

// Preset variants for common use cases
export function NoExpensesEmpty({ onAddExpense }) {
    return (
        <EmptyState
            icon={require("lucide-react").Wallet}
            title="No expenses yet"
            description="Start tracking your group expenses by adding your first expense"
            action={
                <Button
                    onClick={onAddExpense}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                    Add First Expense
                </Button>
            }
        />
    );
}

export function NoGroupsEmpty({ onCreateGroup }) {
    return (
        <EmptyState
            icon={require("lucide-react").Users}
            title="No groups yet"
            description="Create a group to start splitting expenses with friends and family"
            action={
                <Button
                    onClick={onCreateGroup}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                    Create First Group
                </Button>
            }
        />
    );
}

export function NoNotificationsEmpty() {
    return (
        <EmptyState
            icon={require("lucide-react").Bell}
            title="All caught up!"
            description="You don't have any notifications right now. We'll let you know when something new happens."
        />
    );
}

export function NoSearchResultsEmpty({ query, onClear }) {
    return (
        <EmptyState
            icon={require("lucide-react").Search}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try adjusting your search or filters.`}
            action={
                <Button variant="outline" onClick={onClear}>
                    Clear Search
                </Button>
            }
        />
    );
}

export function NoDataForFilterEmpty({ onReset }) {
    return (
        <EmptyState
            icon={require("lucide-react").Filter}
            title="No matching data"
            description="No items match your current filters. Try adjusting or clearing your filters."
            action={
                <Button variant="outline" onClick={onReset}>
                    Reset Filters
                </Button>
            }
        />
    );
}
