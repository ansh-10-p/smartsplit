import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
    X,
    Calendar,
    Tag,
    CreditCard,
    Users,
    ArrowUpDown,
    Check,
    RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FilterPanel({
    isOpen,
    onClose,
    onApply,
    onReset,
    categories = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Utilities", "Rent", "Other"],
    people = [],
    initialFilters = {}
}) {
    // Local state for filters being edited
    const [filters, setFilters] = useState({
        dateRange: "all", // all, today, week, month, custom
        customDateStart: "",
        customDateEnd: "",
        categories: [],
        minAmount: 0,
        maxAmount: 10000,
        selectedPeople: [],
        sortBy: "date", // date, amount
        sortOrder: "desc" // asc, desc
    });

    // Load initial filters when panel opens
    useEffect(() => {
        if (isOpen) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [isOpen, initialFilters]);

    const handleCategoryToggle = (category) => {
        setFilters(prev => {
            const cats = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: cats };
        });
    };

    const handlePersonToggle = (personId) => {
        setFilters(prev => {
            const selected = prev.selectedPeople.includes(personId)
                ? prev.selectedPeople.filter(id => id !== personId)
                : [...prev.selectedPeople, personId];
            return { ...prev, selectedPeople: selected };
        });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters = {
            dateRange: "all",
            customDateStart: "",
            customDateEnd: "",
            categories: [],
            minAmount: 0,
            maxAmount: 10000,
            selectedPeople: [],
            sortBy: "date",
            sortOrder: "desc"
        };
        setFilters(defaultFilters);
        onReset?.(defaultFilters);
    };

    // Helper to count active filters
    const activeCount = [
        filters.dateRange !== "all",
        filters.categories.length > 0,
        filters.minAmount > 0 || filters.maxAmount < 10000,
        filters.selectedPeople.length > 0
    ].filter(Boolean).length;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl">Filters & Sort</SheetTitle>
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="mr-8">
                                {activeCount} active
                            </Badge>
                        )}
                    </div>
                    <SheetDescription>
                        Narrow down your transactions to find exactly what you need.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pb-20">
                    {/* Sort Section */}
                    <section>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                            Sort By
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                value={filters.sortBy}
                                onValueChange={(v) => setFilters(f => ({ ...f, sortBy: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort Field" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="amount">Amount</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.sortOrder}
                                onValueChange={(v) => setFilters(f => ({ ...f, sortOrder: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Newest / Highest First</SelectItem>
                                    <SelectItem value="asc">Oldest / Lowest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Date Range */}
                    <section>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            Date Range
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {["all", "today", "week", "month", "year"].map((range) => (
                                <Badge
                                    key={range}
                                    variant={filters.dateRange === range ? "default" : "outline"}
                                    className="cursor-pointer capitalize px-3 py-1.5"
                                    onClick={() => setFilters(f => ({ ...f, dateRange: range }))}
                                >
                                    {range === "all" ? "All Time" : range}
                                </Badge>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Categories */}
                    <section>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant={filters.categories.includes(cat) ? "default" : "outline"}
                                    className={`cursor-pointer px-3 py-1.5 border-dashed ${filters.categories.includes(cat) ? "border-solid" : ""}`}
                                    onClick={() => handleCategoryToggle(cat)}
                                >
                                    {filters.categories.includes(cat) && <Check className="w-3 h-3 mr-1" />}
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Amount Range */}
                    <section>
                        <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            Amount Range (₹)
                        </h3>
                        {/* Note: Radix UI Slider requires array value */}
                        {/* For simplicity we use min/max inputs here or a simplified UI representation */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Min Amount</label>
                                <Input
                                    type="number"
                                    value={filters.minAmount}
                                    onChange={(e) => setFilters(f => ({ ...f, minAmount: Number(e.target.value) }))}
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Max Amount</label>
                                <Input
                                    type="number"
                                    value={filters.maxAmount}
                                    onChange={(e) => setFilters(f => ({ ...f, maxAmount: Number(e.target.value) }))}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* People Filter */}
                    <section>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Paid By
                        </h3>
                        <div className="space-y-2">
                            {people.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No participants found</p>
                            ) : (
                                people.map(person => (
                                    <div key={person.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`p-${person.id}`}
                                            checked={filters.selectedPeople.includes(person.id)}
                                            onCheckedChange={() => handlePersonToggle(person.id)}
                                        />
                                        <label
                                            htmlFor={`p-${person.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {person.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="outline" onClick={handleReset} className="w-1/3">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button onClick={handleApply} className="w-2/3 bg-gradient-to-r from-purple-600 to-cyan-600">
                        Apply {activeCount > 0 ? `(${activeCount})` : ""} Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
