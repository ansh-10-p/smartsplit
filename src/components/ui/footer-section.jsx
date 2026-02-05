'use client';
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const footerLinks = [
    {
        label: 'Product',
        links: [
            { title: 'Features', href: '#features' },
            { title: 'Pricing', href: '#pricing' },
            { title: 'Testimonials', href: '#testimonials' },
            { title: 'Demo', href: '/dashboard' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'About Us', href: '#' },
            { title: 'FAQs', href: '#faq' },
            { title: 'Privacy Policy', href: '#' },
            { title: 'Terms of Service', href: '#' },
        ],
    },
    {
        label: 'Resources',
        links: [
            { title: 'Blog', href: '#' },
            { title: 'Help Center', href: '#' },
            { title: 'Community', href: '#' },
            { title: 'Contact', href: '#' },
        ],
    },
    {
        label: 'Social',
        links: [
            { title: 'Facebook', href: '#', icon: FacebookIcon },
            { title: 'Instagram', href: '#', icon: InstagramIcon },
            { title: 'Youtube', href: '#', icon: YoutubeIcon },
            { title: 'LinkedIn', href: '#', icon: LinkedinIcon },
        ],
    },
];

export function Footer() {
    return (
        <footer className="relative w-full border-t bg-background/50 backdrop-blur-xl">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

            <div className="relative w-full max-w-7xl mx-auto px-6 py-12 lg:py-16">
                {/* Background Glow */}
                <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[100px]" />

                <div className="grid w-full gap-8 xl:grid-cols-4 xl:gap-12">
                    {/* Brand Column */}
                    <AnimatedContainer className="space-y-6 xl:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                                S
                            </div>
                            <span>SmartSplit</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Split expenses with friends, roommates, and family. The easiest way to track bills and settle up appropriately.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10 hover:text-purple-500">
                                <Github className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-pink-500/10 hover:text-pink-500">
                                <InstagramIcon className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-500">
                                <LinkedinIcon className="w-5 h-5" />
                            </Button>
                        </div>
                        <p className="text-muted-foreground text-xs pt-4">
                            © {new Date().getFullYear()} SmartSplit. All rights reserved.
                        </p>
                    </AnimatedContainer>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-3">
                        {footerLinks.slice(0, 3).map((section, index) => (
                            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground/90">{section.label}</h3>
                                    <ul className="space-y-2.5">
                                        {section.links.map((link) => (
                                            <li key={link.title}>
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-muted-foreground hover:text-purple-500 transition-colors duration-200 flex items-center gap-2"
                                                >
                                                    {link.icon && <link.icon className="w-4 h-4" />}
                                                    {link.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </AnimatedContainer>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

function AnimatedContainer({ className, delay = 0.1, children }) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: 10, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
