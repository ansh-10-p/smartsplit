import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Calculator,
    Receipt,
    Users,
    TrendingUp,
    Sparkles,
    PieChart,
    Send,
    Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const quickPrompts = [
    { icon: Calculator, label: "Calculate split", color: "purple", prompt: "Help me calculate how to split a bill equally" },
    { icon: Receipt, label: "Scan receipt", color: "cyan", prompt: "How do I scan and add a receipt?" },
    { icon: Users, label: "Group summary", color: "green", prompt: "Give me a summary of my group expenses" },
    { icon: TrendingUp, label: "Spending trends", color: "orange", prompt: "Show me my spending trends this month" },
    { icon: PieChart, label: "Budget plan", color: "pink", prompt: "Help me create a budget plan" },
];

export default function AIChat() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your SmartSplit AI assistant. I can help you analyze expenses, suggest splits, create summaries, and more. How can I help you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                role: "assistant",
                content: "I understand you need help with that. This is a demo response. In a real implementation, I would analyze your expenses and provide detailed insights based on your request.",
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 sm:py-20 mb-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                            AI Assistant
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light">
                            Get intelligent insights about your expenses, splits, and financial planning
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6">
                {/* Quick Prompts */}
                {messages.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Quick Actions</h2>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className={`h-9 cursor-pointer gap-2 text-sm rounded-lg hover:bg-${prompt.color}-100 dark:hover:bg-${prompt.color}-900/50 transition-colors px-4`}
                                    onClick={() => handleQuickPrompt(prompt.prompt)}
                                >
                                    <prompt.icon className={`h-4 w-4 text-${prompt.color}-500`} />
                                    {prompt.label}
                                </Badge>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                <Card className="mb-6 border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                    <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                        {messages.map((message, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-foreground"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Input Area */}
                <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-lg sticky bottom-6">
                    <CardContent className="p-4">
                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Ask me anything about your expenses..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="self-end bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg"
                                size="icon"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
