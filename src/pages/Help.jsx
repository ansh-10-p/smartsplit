import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    HelpCircle,
    Search,
    BookOpen,
    Video,
    Keyboard,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Sparkles,
    Zap,
    Users,
    Receipt,
    Settings,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const categories = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Sparkles,
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
        articles: [
            { title: "Welcome to SmartSplit", desc: "Learn the basics of expense splitting" },
            { title: "Creating Your First Group", desc: "Set up a group and invite members" },
            { title: "Adding Your First Expense", desc: "Track expenses in seconds" },
            { title: "Understanding Settlements", desc: "How SmartSplit calculates who owes whom" },
        ],
    },
    {
        id: "features",
        title: "Features",
        icon: Zap,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
        articles: [
            { title: "AI Expense Categorization", desc: "Automatic expense categorization" },
            { title: "Voice Input", desc: "Add expenses using voice commands" },
            { title: "Payment Reminders", desc: "Send fun meme-based reminders" },
            { title: "Analytics Dashboard", desc: "Visualize your spending patterns" },
        ],
    },
    {
        id: "groups",
        title: "Groups & Sharing",
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        articles: [
            { title: "Managing Group Members", desc: "Add, remove, and manage participants" },
            { title: "Group Settings", desc: "Configure default split preferences" },
            { title: "Archiving Groups", desc: "Hide completed or old groups" },
            { title: "Exporting Group Data", desc: "Download group expense reports" },
        ],
    },
    {
        id: "troubleshooting",
        title: "Troubleshooting",
        icon: Settings,
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        articles: [
            { title: "Data Not Syncing", desc: "Troubleshoot local storage issues" },
            { title: "Incorrect Calculations", desc: "Understanding split logic" },
            { title: "Missing Expenses", desc: "Recover deleted expenses" },
            { title: "Browser Compatibility", desc: "Supported browsers and features" },
        ],
    },
];

const faqs = [
    {
        q: "Is SmartSplit free to use?",
        a: "Yes! SmartSplit is completely free for personal use. All features including AI categorization, voice input, and unlimited groups are available at no cost.",
    },
    {
        q: "Is my data secure?",
        a: "Your data is stored locally in your browser using localStorage. We don't send your data to any servers, ensuring complete privacy and security.",
    },
    {
        q: "Can I use SmartSplit offline?",
        a: "Yes! Since all data is stored locally, you can use SmartSplit offline. However, features like AI categorization require an internet connection.",
    },
    {
        q: "How do I export my data?",
        a: "Go to Settings > Data Management and click 'Export All Data'. This will download a JSON file with all your expenses, groups, and settings.",
    },
    {
        q: "Can I sync data across devices?",
        a: "Currently, data is stored locally per device. You can export from one device and import to another using the Export/Import feature in Settings.",
    },
    {
        q: "What browsers are supported?",
        a: "SmartSplit works best on modern browsers: Chrome, Firefox, Safari, and Edge. Some features like voice input may not work on older browsers.",
    },
];

const keyboardShortcuts = [
    { keys: ["Cmd/Ctrl", "K"], action: "Open command palette" },
    { keys: ["Cmd/Ctrl", "N"], action: "Add new expense" },
    { keys: ["Cmd/Ctrl", "G"], action: "Create new group" },
    { keys: ["Cmd/Ctrl", "/"], action: "Open help" },
    { keys: ["Esc"], action: "Close modal/dialog" },
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFaq, setExpandedFaq] = useState(null);

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const filteredCategories = categories.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
            (article) =>
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.desc.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((cat) => cat.articles.length > 0);

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
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                            Help Center
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
                            Find answers, learn features, and get the most out of SmartSplit
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    placeholder="Search for help articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-14 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-12">
                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Documentation</h3>
                                    <p className="text-sm text-muted-foreground">Complete guides</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Video Tutorials</h3>
                                    <p className="text-sm text-muted-foreground">Watch and learn</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Contact Support</h3>
                                    <p className="text-sm text-muted-foreground">Get help now</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Help Categories */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Browse by Category</h2>
                    <div className="grid gap-6">
                        {(searchQuery ? filteredCategories : categories).map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                                                <category.icon className={`w-6 h-6 ${category.color}`} />
                                            </div>
                                            <div>
                                                <CardTitle>{category.title}</CardTitle>
                                                <CardDescription>{category.articles.length} articles</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {category.articles.map((article, i) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                >
                                                    <h4 className="font-medium mb-1">{article.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{article.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className="border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => toggleFaq(index)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-medium">{faq.q}</CardTitle>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {expandedFaq === index && (
                                    <CardContent className="pt-0">
                                        <p className="text-muted-foreground">{faq.a}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Keyboard className="w-6 h-6 text-purple-600" />
                            <CardTitle>Keyboard Shortcuts</CardTitle>
                        </div>
                        <CardDescription>Work faster with keyboard shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {keyboardShortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="text-sm">{shortcut.action}</span>
                                    <div className="flex gap-1">
                                        {shortcut.keys.map((key, i) => (
                                            <React.Fragment key={i}>
                                                <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                                                    {key}
                                                </kbd>
                                                {i < shortcut.keys.length - 1 && <span className="text-muted-foreground mx-1">+</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Support */}
                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                                <p className="text-muted-foreground mb-4">
                                    Can't find what you're looking for? Our support team is here to help.
                                </p>
                            </div>
                            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Support
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
