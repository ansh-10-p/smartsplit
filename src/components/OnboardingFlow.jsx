import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import {
    ArrowRight,
    Check,
    User,
    Users,
    Wallet,
    Sparkles,
    X,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "../App";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ONBOARDING_KEY = "smartsplit_onboarding_complete";

export default function OnboardingFlow() {
    const { user, login } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Step state
    const [userName, setUserName] = useState(user?.username || user?.name || "");
    const [groupName, setGroupName] = useState("");

    useEffect(() => {
        // Check if onboarding is completed
        const isCompleted = localStorage.getItem(ONBOARDING_KEY);
        // Only show if user is logged in and hasn't completed onboarding
        if (user && !isCompleted) {
            setIsOpen(true);
            setUserName(user.username || user.name || "");
        }
    }, [user]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setTimeout(() => {
            setIsOpen(false);
        }, 4000); // Wait for confetti
    };

    const handleSkip = () => {
        if (confirm("Skip the onboarding tour? You can restart it later from Settings.")) {
            localStorage.setItem(ONBOARDING_KEY, "true");
            setIsOpen(false);
        }
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const saveProfile = () => {
        if (user && userName) {
            const updatedUser = { ...user, username: userName, name: userName };
            login(updatedUser); // Update context/storage
        }
        handleNext();
    };

    const saveGroup = () => {
        if (groupName) {
            const groups = JSON.parse(localStorage.getItem("smartsplit_groups_v1") || "[]");
            const newGroup = {
                id: `g_${Math.random().toString(36).slice(2, 9)}`,
                name: groupName,
                members: [{ id: "u1", name: userName || "You", isAdmin: true }],
                createdAt: Date.now()
            };
            localStorage.setItem("smartsplit_groups_v1", JSON.stringify([...groups, newGroup]));
        }
        handleNext();
    };

    if (!isOpen) return null;

    const steps = [
        // Step 0: Welcome
        {
            title: "Welcome to SmartSplit!",
            description: "The easiest way to split expenses with friends and family. Let's get you set up in less than 2 minutes.",
            icon: Sparkles,
            content: (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Wallet className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-center text-muted-foreground">
                        Track balances, settle debts, and manage budgets cleanly and efficiently.
                    </p>
                </div>
            ),
            action: handleNext,
            btnText: "Get Started"
        },
        // Step 1: Profile
        {
            title: "Set up your profile",
            description: "How should we verify you to others?",
            icon: User,
            content: (
                <div className="flex flex-col items-center gap-6 py-6">
                    <Avatar className="w-24 h-24 border-4 border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                        <AvatarFallback>{userName.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="w-full max-w-xs space-y-2">
                        <label className="text-sm font-medium">Display Name</label>
                        <Input
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Your Name"
                            autoFocus
                        />
                    </div>
                </div>
            ),
            action: saveProfile,
            btnText: "Looks Good"
        },
        // Step 2: First Group
        {
            title: "Create your first group",
            description: "Groups help you organize expenses for trips, housemates, or events.",
            icon: Users,
            content: (
                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="w-full max-w-xs space-y-2">
                        <label className="text-sm font-medium">Group Name</label>
                        <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g., Summer Trip, Apartment 302"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">You can add members later.</p>
                    </div>
                </div>
            ),
            action: saveGroup,
            btnText: groupName ? "Create Group" : "Skip for Now"
        },
        // Step 3: Features
        {
            title: "Powerful Features",
            description: "Here is what you can do with SmartSplit.",
            icon: Sparkles,
            content: (
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <Wallet className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                        <h4 className="font-semibold text-sm">Split Bills</h4>
                        <p className="text-xs text-muted-foreground">Fair & easy</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 mx-auto mb-2 pointer-events-none">
                            <span className="font-bold text-lg">AI</span>
                        </Button>
                        <h4 className="font-semibold text-sm">AI Insights</h4>
                        <p className="text-xs text-muted-foreground">Smart analysis</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <h4 className="font-semibold text-sm">Groups</h4>
                        <p className="text-xs text-muted-foreground">Organize expenses</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <h4 className="font-semibold text-sm">Settlements</h4>
                        <p className="text-xs text-muted-foreground">Easy payments</p>
                    </div>
                </div>
            ),
            action: handleNext,
            btnText: "Awesome"
        },
        // Step 4: Completion
        {
            title: "You're all set!",
            description: "Ready to start managing your expenses smarter? Let's go!",
            icon: Check,
            content: (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <Check className="w-12 h-12" />
                    </div>
                    <p className="text-center font-medium">
                        Your dashboard is ready.
                    </p>
                </div>
            ),
            action: handleComplete,
            btnText: "Go to Dashboard",
            isLast: true
        }
    ];

    const currentStep = steps[step];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
                {step === steps.length - 1 && (
                    <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
                )}

                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-cyan-600"
                            initial={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                    <currentStep.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{currentStep.description}</p>
                                </div>
                            </div>
                            {!currentStep.isLast && (
                                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                                    Skip
                                </Button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="min-h-[200px]">
                            {currentStep.content}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-8">
                            <div className="flex gap-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-purple-600" : "bg-slate-200 dark:bg-slate-700"}`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {step > 0 && !currentStep.isLast && (
                                    <Button variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    onClick={currentStep.action}
                                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg"
                                >
                                    {currentStep.btnText}
                                    {!currentStep.isLast && <ChevronRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
