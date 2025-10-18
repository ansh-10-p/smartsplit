import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { User, UserCircle, PaintBrush, Briefcase, Rocket } from "phosphor-react";

const testimonials = [
    {
        name: "Raj Patel",
        role: "Software Engineer",
        text: "SmartSplit made managing our group trips effortless. Love the neon vibe too!",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        icon: User
    },
    {
        name: "Sarah Williams",
        role: "Product Manager",
        text: "Finally, an app that understands group expenses without the headache. Highly recommend!",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        icon: UserCircle
    },
    {
        name: "Alex Chen",
        role: "Designer",
        text: "The AI categorization is spot on! Saves me so much time organizing expenses.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        icon: PaintBrush
    },
    {
        name: "Priya Sharma",
        role: "Marketing Lead",
        text: "The meme reminders are hilarious! My friends actually look forward to paying now.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        icon: Briefcase
    },
    {
        name: "Mike Johnson",
        role: "Startup Founder",
        text: "Perfect for our team dinners and office expenses. Clean, fast, and reliable.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        icon: Rocket
    }
];

export default function TestimonialsCarousel({ darkMode }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [imageLoading, setImageLoading] = useState({});

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    useEffect(() => {
        setImageLoading(prev => ({ ...prev, [currentIndex]: true }));
    }, [currentIndex]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    const currentTestimonial = testimonials[currentIndex];

    return (
        <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`p-8 md:p-12 text-center ${darkMode
                            ? "bg-white/10 border border-white/20 backdrop-blur-md"
                            : "bg-white/80 border border-gray-200 backdrop-blur-md"
                            }`}
                    >
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                {imageLoading[currentIndex] !== false && (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <img
                                    src={currentTestimonial.avatar}
                                    alt={`${currentTestimonial.name} profile`}
                                    className={`w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-lg transition-opacity duration-300 ${imageLoading[currentIndex] === false ? 'opacity-100' : 'opacity-0 absolute'
                                        }`}
                                    onLoad={() => setImageLoading(prev => ({ ...prev, [currentIndex]: false }))}
                                    onError={() => setImageLoading(prev => ({ ...prev, [currentIndex]: 'error' }))}
                                />
                                {imageLoading[currentIndex] === 'error' && (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                                        <currentTestimonial.icon className="w-10 h-10 text-white" weight="fill" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center mb-4">
                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>

                        <blockquote className="text-lg md:text-xl mb-6 italic leading-relaxed">
                            "{currentTestimonial.text}"
                        </blockquote>

                        <div className="space-y-1">
                            <div className="font-semibold text-lg">{currentTestimonial.name}</div>
                            <div className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                {currentTestimonial.role}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <button
                    onClick={prevTestimonial}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${darkMode
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    aria-label="Previous testimonial"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={nextTestimonial}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${darkMode
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    aria-label="Next testimonial"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex
                            ? darkMode
                                ? "bg-purple-400 scale-125"
                                : "bg-cyan-500 scale-125"
                            : darkMode
                                ? "bg-white/30 hover:bg-white/50"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>

            <div className="text-center mt-4">
                <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${darkMode
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                >
                    {isAutoPlaying ? "Pause" : "Play"} Auto-rotate
                </button>
            </div>
        </div>
    );
}
