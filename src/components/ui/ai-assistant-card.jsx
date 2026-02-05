import React from "react";
import {
    Calculator,
    Receipt,
    Users,
    TrendingUp,
    Sparkles,
    PieChart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function AIAssistantCard({ userName = "Friend" }) {
    return (
        <Card className="flex h-full w-full max-w-md flex-col gap-6 p-6 bg-gradient-to-br from-purple-50/50 to-cyan-50/50 dark:from-purple-950/20 dark:to-cyan-950/20 border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="flex flex-1 flex-col p-0 space-y-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* AI Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-50" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 text-center">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-medium tracking-tight text-muted-foreground">
                                Hi {userName},
                            </h2>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Need help with expenses?
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            I can help you analyze spending, suggest splits, or create expense summaries. Choose a prompt below!
                        </p>
                    </div>

                    {/* Quick Action Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge
                            variant="secondary"
                            className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            <Calculator className="h-3.5 w-3.5 text-purple-500" />
                            Calculate split
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
                        >
                            <Receipt className="h-3.5 w-3.5 text-cyan-500" />
                            Scan receipt
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        >
                            <Users className="h-3.5 w-3.5 text-green-500" />
                            Group summary
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                        >
                            <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                            Spending trends
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
                        >
                            <PieChart className="h-3.5 w-3.5 text-pink-500" />
                            Budget plan
                        </Badge>
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative mt-auto flex-col rounded-lg ring-1 ring-border bg-background">
                    <div className="relative">
                        <Textarea
                            placeholder="Ask me anything about your expenses..."
                            className="min-h-[100px] resize-none rounded-lg border-none shadow-none focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-b-lg border-t bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2 gap-1.5 text-xs">
                                <Sparkles className="h-3 w-3" />
                                Suggest
                            </Button>
                        </div>

                        <Button size="sm" className="h-7 px-3 gap-1.5 text-xs bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                            <Sparkles className="h-3 w-3" />
                            Ask AI
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
