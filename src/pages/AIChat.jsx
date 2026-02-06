import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    Calculator,
    Receipt,
    Users,
    TrendingUp,
    Sparkles,
    PieChart,
    Send,
    Loader2,
    Bot,
    User,
    AlertCircle
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
    const messagesEndRef = useRef(null);

    // Initialize Gemini API
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    console.log("API Key present:", !!apiKey); // Debug log
    const genAI = new GoogleGenerativeAI(apiKey || "");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Debug: List available models
    useEffect(() => {
        const listModels = async () => {
            if (!genAI) return;
            try {
                // Not the most standard way in some SDK versions, but let's try to get info if possible
                // Or simply log that we are trying to connect
                console.log("Attempting to connect with key:", apiKey ? "Present" : "Missing");

                // There isn't a direct "listModels" on genAI instance in all SDK versions easily accessible on client 
                // without admin rights in some contexts, but let's try a simple generation to test access
                // If 404 persists, it's definitely the model name.

            } catch (e) {
                console.error("Debug Error:", e);
            }
        };
        listModels();
    }, []);

    const getContextData = () => {
        try {
            const expenses = JSON.parse(localStorage.getItem("smartsplit_expenses_v1") || "[]");
            const budgets = JSON.parse(localStorage.getItem("smartsplit_budgets_v1") || "[]");
            const participants = JSON.parse(localStorage.getItem("smartsplit_participants_v1") || "[]");

            return JSON.stringify({
                expenses: expenses.slice(0, 20), // Limit to recent expenses to avoid lighting up token limits
                budgets,
                participants,
                summary: `User has ${expenses.length} expenses recorded and ${participants.length} participants.`
            });
        } catch (error) {
            console.error("Error fetching context:", error);
            return "Unable to access local financial data.";
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const context = getContextData();

            const prompt = `
            You are SmartSplit AI, a financial assistant for a bill splitting app. 
            
            Context Data (JSON):
            ${context}
            
            User Question: ${userMessage.content}
            
            Instructions:
            1. Be helpful, concise, and friendly.
            2. Use the provided JSON data to answer questions about expenses, budgets, or participants if relevant.
            3. If the user asks about something not in the data, give general financial advice or explain you don't have that info.
            4. Format your response nicely (you can use markdown).
            5. Do NOT mention "JSON data" or "context" explicitly to the user. Just answer naturally.
            `;

            const text = await generateResponse(prompt);
            setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        } catch (error) {
            console.error("All AI Models failed:", error);

            const errorMessage = error.message || "Unknown error";
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `⚠️ Error: Helper could not connect. \n\nDetails: ${errorMessage}\n\nPlease check your internet or API key.`,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 sm:py-16 mb-8">
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
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                            AI Assistant
                        </h1>
                        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light">
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
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Badge
                                        variant="secondary"
                                        className="h-9 cursor-pointer gap-2 text-sm rounded-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all px-4 shadow-md hover:shadow-lg"
                                        onClick={() => handleQuickPrompt(prompt.prompt)}
                                    >
                                        <prompt.icon className={`h-4 w-4 text-${prompt.color}-500`} />
                                        {prompt.label}
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                <Card className="mb-6 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg min-h-[400px] flex flex-col">
                    <CardContent className="p-6 space-y-6 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((message, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {message.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                    )}

                                    <motion.div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${message.role === "user"
                                            ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-tr-none"
                                            : message.isError
                                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-tl-none"
                                                : "backdrop-blur-sm bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-none"
                                            }`}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </motion.div>

                                    {message.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 justify-start"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="backdrop-blur-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                    <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>
                </Card>

                {/* Input Area */}
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg sticky bottom-6 z-10">
                    <CardContent className="p-4">
                        <div className="flex gap-2 items-end">
                            <Textarea
                                placeholder="Ask me about your spending, split calculations, or budgeting advice..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="min-h-[50px] max-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 text-base"
                                rows={1}
                            />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pb-1">
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="self-end bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                                    size="icon"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
