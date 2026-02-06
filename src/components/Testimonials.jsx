import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

const testimonials = [
    {
        text: "SmartSplit has completely transformed how we manage our group trips. No more awkward conversations about money!",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        name: "Sarah Chen",
        role: "Travel Enthusiast",
    },
    {
        text: "The best expense splitting app I've used. The interface is beautiful and the settlements are instant.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        name: "Michael Park",
        role: "Product Designer",
    },
    {
        text: "I use this for my apartment expenses with 3 roommates. It keeps everything organized and fair.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        name: "Emma Wilson",
        role: "Student",
    },
    {
        text: "The AI receipt scanning feature is a game changer. Saves me so much time entering expenses manually.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
        name: "David Rodriguez",
        role: "Small Business Owner",
    },
    {
        text: "Finally, an app that handles complex splits correctly. Love the clean design and dark mode!",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
        name: "Lisa Thompson",
        role: "UX Researcher",
    },
    {
        text: "Groups feature is implemented perfectly. I can track office lunches and road trips separately.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        name: "James Wilson",
        role: "Project Manager",
    },
    {
        text: "Customer support is amazing. They helped me recover my account in minutes. Highly recommended!",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
        name: "Anita Patel",
        role: "Marketing Director",
    },
    {
        text: "The settlement options are great. Being able to record cash payments or UPI links is super helpful.",
        image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80",
        name: "Robert Taylor",
        role: "Freelancer",
    },
    {
        text: "SmartSplit made our bachelor party expenses stress-free. Everyone knew exactly what they owed.",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        name: "Alex Jordan",
        role: "Event Planner",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Testimonials() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-16 text-center"
                >
                    <div className="flex justify-center mb-4">
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium border border-purple-200 dark:border-purple-800">
                            Testimonials
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        What our users say
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Join thousands of users who have simplified their group expenses with SmartSplit.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={40} />
                    <TestimonialsColumn
                        testimonials={secondColumn}
                        className="hidden md:block"
                        duration={50}
                    />
                    <TestimonialsColumn
                        testimonials={thirdColumn}
                        className="hidden lg:block"
                        duration={35}
                    />
                </div>
            </div>
        </section>
    );
}
