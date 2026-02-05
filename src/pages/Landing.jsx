import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import { Lightning, Bell, CreditCard, Sun, Moon, Check, X as XIcon } from "phosphor-react";
import { motion } from "framer-motion";
import { Wallet, Receipt, Users, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Web3MediaHero } from "@/components/ui/web3media-hero";
import { Footer } from "@/components/ui/footer-section";
import NumberFlow from "@number-flow/react";

const features = [
  { icon: Receipt, title: "AI Expense Categorization", desc: "Automatically tags your expenses so you spend less time sorting and more time living." },
  { icon: Bell, title: "Fun & Friendly Reminders", desc: "Never miss a payment with gentle, timely nudges your friends will actually appreciate." },
  { icon: Wallet, title: "One‑Tap Pay Mock", desc: "Simplify settling up with a single tap — mock UPI payments to practice before real ones." },
];

const howItWorks = [
  { step: "1", title: "Create a group", desc: "Add friends and set your default split preferences." },
  { step: "2", title: "Add expenses", desc: "Scan receipts or use AI/voice to add in seconds." },
  { step: "3", title: "Settle smart", desc: "Get minimal transactions and one‑tap Pay mocks." },
];

const faqs = [
  { q: "Is this free?", a: "Yes, this demo is fully local and free to try." },
  { q: "Does UPI really work?", a: "It’s a safe mock for demo; open your UPI app with a prefilled link." },
  { q: "Will my data sync?", a: "This demo stores data locally. Export/import from Settings anytime." },
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "Perfect for roommates and small trips.",
    features: ["Unlimited Groups", "Basic Expense Tracking", "Mock UPI Payments", "Local Data Storage"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 199,
    yearlyPrice: 1599,
    description: "For power users who travel often.",
    features: ["Everything in Free", "Receipt Scanning (AI)", "Export to PDF/CSV", "Priority Support"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Team",
    price: 499,
    yearlyPrice: 3999,
    description: "Best for organizations and large events.",
    features: ["Everything in Pro", "Team Management", "Advanced Analytics", "Dedicated Account Manager"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors overflow-x-hidden">
      {/* Navbar Overlay for Theme Toggle */}
      <div className="fixed top-0 right-0 p-6 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full shadow-lg border border-border/50 backdrop-blur-md bg-background/50"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Hero Component Integration */}
      <Web3MediaHero
        logo="SmartSplit"
        title="Split Smart."
        highlightedText="Pay Easy."
        subtitle="Manage group expenses with AI categorization, playful reminders, and one‑tap mock payments. The easiest way to share expenses."
        ctaButton={{
          label: "Get Started Free",
          onClick: () => navigate("/signup"),
        }}
        navigation={[
          { label: "Features", onClick: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "Pricing", onClick: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "FAQ", onClick: () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }) },
          { label: "Demo", onClick: () => navigate("/dashboard") },
        ]}
        cryptoIcons={[
          {
            icon: <Wallet className="w-8 h-8 text-cyan-400" />,
            label: "Track",
            position: { x: "15%", y: "20%" },
          },
          {
            icon: <Receipt className="w-8 h-8 text-purple-400" />,
            label: "Scan",
            position: { x: "80%", y: "25%" },
          },
          {
            icon: <Users className="w-8 h-8 text-fuchsia-400" />,
            label: "Split",
            position: { x: "75%", y: "65%" },
          },
          {
            icon: <ArrowRight className="w-8 h-8 text-emerald-400" />,
            label: "Pay",
            position: { x: "10%", y: "60%" },
          },
        ]}
        brands={[
          { logo: <div className="text-xl font-bold text-muted-foreground/50">Airbnb</div> },
          { logo: <div className="text-xl font-bold text-muted-foreground/50">Uber</div> },
          { logo: <div className="text-xl font-bold text-muted-foreground/50">Spotify</div> },
          { logo: <div className="text-xl font-bold text-muted-foreground/50">Netflix</div> },
          { logo: <div className="text-xl font-bold text-muted-foreground/50">Zomato</div> },
        ]}
      />

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12 relative z-20 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Groups Managed", value: "5k+" },
            { label: "Expenses Tracked", value: "₹2Cr+" },
            { label: "Settlement Rate", value: "98%" },
          ].map((stat, i) => (
            <Card key={i} className="text-center border border-border/10 shadow-xl bg-background/5 backdrop-blur-md">
              <CardContent className="pt-6">
                <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12 opacity-50 max-w-6xl mx-auto" />

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20 relative">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Why SmartSplit?</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Detailed features to help you split expenses effortlessly.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Card key={i} className="border border-border/50 shadow-lg bg-card/30 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4 text-primary border border-white/10">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 relative">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-2">Simple Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Choose your plan</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transparent pricing. All plans include unlimited friends.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative mx-auto flex w-fit rounded-full bg-muted/50 border border-border p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 w-fit h-10 sm:h-12 rounded-full px-4 sm:px-6 py-2 font-medium transition-colors ${!isYearly
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {!isYearly && (
                <motion.span
                  layoutId="pricing-switch"
                  className="absolute top-0 left-0 h-full w-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>

            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 w-fit h-10 sm:h-12 rounded-full px-4 sm:px-6 py-2 font-medium transition-colors ${isYearly
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {isYearly && (
                <motion.span
                  layoutId="pricing-switch"
                  className="absolute top-0 left-0 h-full w-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                Yearly
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                  Save 20%
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                className={`relative flex flex-col h-full bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all ${plan.popular ? "border-purple-500 shadow-2xl shadow-purple-500/20 scale-105 z-10" : "border-border/50"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 border-0 px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-4">
                    <span className="text-4xl font-bold">
                      ₹
                      <NumberFlow
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        format={{ notation: "standard" }}
                        className="inline"
                      />
                    </span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-1 text-green-500">
                          <Check className="h-3 w-3" weight="bold" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg shadow-purple-500/25" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Card key={i} className="border-border/40 bg-card/20">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  {f.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground pt-0 mt-4">
                {f.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
