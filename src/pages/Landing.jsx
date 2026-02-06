import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Check,
  Star,
  Play,
  ChevronRight,
  Mail,
  Lock,
  Globe,
  Award,
  BarChart3,
  Smartphone,
  Brain,
  Receipt,
  Bell,
  Wallet,
  Sun,
  Moon,
  X,
  Quote,
  Rocket,
  Target,
  Infinity,
  Code,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import Testimonials from "@/components/Testimonials";
import VideoPlayer from "@/components/ui/video-player";

// Floating Animation Component
const FloatingElement = ({ children, delay = 0, duration = 3 }) => {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Mouse Follower Component
const MouseFollower = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed w-8 h-8 rounded-full border-2 border-purple-500/50 pointer-events-none z-50 hidden lg:block"
      style={{
        left: cursorXSpring,
        top: cursorYSpring,
      }}
    />
  );
};

const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}><NumberFlow value={count} /></span>;
};

// Testimonials data moved to component

const features = [
  {
    icon: Brain,
    title: "AI-Powered Categorization",
    description: "Automatically categorize expenses with machine learning. No manual tagging needed.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Splits",
    description: "Split bills in seconds with smart algorithms that minimize transactions.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Receipt,
    title: "Receipt Scanning",
    description: "Snap a photo of your receipt and let AI extract all the details automatically.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Group Management",
    description: "Create unlimited groups for trips, roommates, events, and more.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Friendly payment reminders that actually get people to pay up.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Visualize spending patterns with beautiful charts and insights.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

const comparisonData = [
  { feature: "AI Expense Categorization", smartsplit: true, splitwise: false, venmo: false },
  { feature: "Receipt Scanning", smartsplit: true, splitwise: true, venmo: false },
  { feature: "Unlimited Groups", smartsplit: true, splitwise: false, venmo: false },
  { feature: "Advanced Analytics", smartsplit: true, splitwise: false, venmo: false },
  { feature: "Voice Input", smartsplit: true, splitwise: false, venmo: false },
  { feature: "Budget Planner", smartsplit: true, splitwise: false, venmo: false },
  { feature: "Free Forever", smartsplit: true, splitwise: false, venmo: true },
];

const stats = [
  { value: 50000, label: "Active Users", suffix: "+", icon: Users },
  { value: 1000000, label: "Expenses Tracked", suffix: "+", icon: Receipt },
  { value: 99, label: "User Satisfaction", suffix: "%", icon: Star },
  { value: 24, label: "Countries", suffix: "+", icon: Globe },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Group",
    description: "Add friends, family, or colleagues in seconds. Set default split preferences.",
    icon: Users,
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "02",
    title: "Add Expenses",
    description: "Use AI, voice input, or scan receipts. SmartSplit does the heavy lifting.",
    icon: Receipt,
    color: "from-cyan-500 to-blue-500",
  },
  {
    step: "03",
    title: "Settle Smart",
    description: "Get optimized payment plans. Pay with one tap using UPI integration.",
    icon: Wallet,
    color: "from-green-500 to-emerald-500",
  },
];

const logos = [
  { name: "TechCrunch", icon: Code },
  { name: "Forbes", icon: TrendingUp },
  { name: "Wired", icon: Cpu },
  { name: "The Verge", icon: Layers },
];

export default function Landing() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });
  const [email, setEmail] = useState("");
  const [activeDemo, setActiveDemo] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    alert(`Thanks for subscribing! We'll send updates to ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
      <MouseFollower />

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl animate-spin-slow" />

          {/* Floating Icons */}
          <FloatingElement delay={0} duration={4}>
            <div className="absolute top-20 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl opacity-20">
              <Receipt className="w-8 h-8 text-white" />
            </div>
          </FloatingElement>
          <FloatingElement delay={1} duration={5}>
            <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl opacity-20">
              <Users className="w-10 h-10 text-white" />
            </div>
          </FloatingElement>
          <FloatingElement delay={2} duration={3.5}>
            <div className="absolute top-1/3 left-20 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl opacity-20">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </FloatingElement>
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 max-w-6xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 text-sm shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
              AI-Powered Expense Splitting
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 animate-gradient">
              Split Bills,
            </span>
            <br />
            <span className="text-foreground">Not Friendships</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            The smartest way to track group expenses, split bills, and settle up.{" "}
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Powered by AI.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-purple-500/50 transition-all group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg group backdrop-blur-sm"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Video Player Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <VideoPlayer src="https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4" />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            {[
              { icon: Shield, text: "Bank-level Security", color: "text-green-600" },
              { icon: Users, text: "50,000+ Users", color: "text-blue-600" },
              { icon: Star, text: "4.9/5 Rating", color: "text-yellow-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 px-6 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by teams at</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
            {logos.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <logo.icon className="w-6 h-6" />
                <span className="font-semibold text-lg">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600">
                  <AnimatedCounter end={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get started in
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600">
                three simple steps
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <Card className="h-full border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all">
                  <CardContent className="pt-12 pb-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center shadow-xl`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-slate-200 dark:text-slate-800 mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-purple-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600">
                split smarter
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Powerful features designed to make expense splitting effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <Card className="h-full border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 overflow-hidden relative">
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>

                  {/* Animated border gradient */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur-xl" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">Comparison</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why choose
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600">
                SmartSplit?
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="p-4 font-semibold">
                        <div className="flex flex-col items-center">
                          <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white mb-2">
                            SmartSplit
                          </Badge>
                        </div>
                      </th>
                      <th className="p-4 text-muted-foreground">Splitwise</th>
                      <th className="p-4 text-muted-foreground">Venmo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.smartsplit ? (
                            <motion.div whileHover={{ scale: 1.2 }}>
                              <Check className="w-6 h-6 text-green-600 mx-auto" />
                            </motion.div>
                          ) : (
                            <X className="w-6 h-6 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.splitwise ? (
                            <Check className="w-6 h-6 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.venmo ? (
                            <Check className="w-6 h-6 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-2xl bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Mail className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold mb-4">Stay in the loop</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Get the latest updates, tips, and exclusive features delivered to your inbox
                </p>
                <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 h-12 px-8"
                    >
                      Subscribe
                    </Button>
                  </motion.div>
                </form>
                <p className="text-xs text-muted-foreground mt-4">
                  No spam. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <FloatingElement delay={0}>
          <div className="absolute top-10 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </FloatingElement>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Rocket className="w-16 h-16 mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to split smarter?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of users who've simplified their group expenses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-white text-purple-600 hover:bg-slate-100 px-8 py-6 text-lg shadow-2xl group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg" />
                <span className="font-bold text-lg">SmartSplit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The smartest way to split expenses with friends and family.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/analytics" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/budget" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 SmartSplit. All rights reserved.
            </p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.3 }}>
                <Shield className="w-5 h-5 text-green-600" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.3 }}>
                <Lock className="w-5 h-5 text-blue-600" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.3 }}>
                <Award className="w-5 h-5 text-yellow-600" />
              </motion.div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
