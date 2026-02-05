import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Web3MediaHero({
    logo = "SmartSplit",
    navigation = [],
    contactButton,
    title,
    highlightedText = "Expenses",
    subtitle,
    ctaButton,
    cryptoIcons = [],
    trustedByText = "Trusted by",
    brands = [],
    className,
    children,
}) {
    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex flex-col overflow-hidden bg-background",
                className
            )}
            role="banner"
            aria-label="Hero section"
        >
            {/* Radial Glow Background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute"
                    style={{
                        width: "1200px",
                        height: "1200px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                        filter: "blur(100px)",
                    }}
                />
                <div
                    className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"
                />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16 pt-6 pb-6"
            >
                {/* Logo */}
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                        S
                    </div>
                    <span>
                        <span className="font-normal">{logo.split(" ")[0]}</span>
                        <span className="text-purple-500">{logo.split(" ")[1] || ""}</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
                    {navigation.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className="hover:text-purple-400 transition-colors text-sm font-medium text-muted-foreground"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Contact Button */}
                {contactButton && (
                    <button
                        onClick={contactButton.onClick}
                        className="px-6 py-2.5 rounded-full transition-all hover:scale-105 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-sm font-medium"
                    >
                        {contactButton.label}
                    </button>
                )}
            </motion.header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                {/* Floating Icons */}
                {cryptoIcons.map((crypto, index) => (
                    <motion.div
                        key={index}
                        className="absolute flex flex-col items-center gap-2"
                        style={{
                            left: crypto.position.x,
                            top: crypto.position.y,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: [0, -20, 0],
                        }}
                        transition={{
                            opacity: { duration: 0.6, delay: 0.3 + index * 0.1 },
                            scale: { duration: 0.6, delay: 0.3 + index * 0.1 },
                            y: {
                                duration: 3 + index * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                    >
                        <div
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/50 backdrop-blur-md border border-purple-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.2)] text-purple-400"
                        >
                            {crypto.icon}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            {crypto.label}
                        </span>
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col items-center text-center max-w-4xl gap-8"
                >
                    {/* Logo Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-medium text-purple-300 tracking-wider uppercase"
                    >
                        The Future of Splitting
                    </motion.div>

                    {/* Title */}
                    <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none text-foreground">
                        {title}
                        <br />
                        <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                            {highlightedText}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                        {subtitle}
                    </p>

                    {/* CTA Button */}
                    {ctaButton && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={ctaButton.onClick}
                            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all text-lg"
                        >
                            {ctaButton.label}
                        </motion.button>
                    )}
                </motion.div>
            </div>

            {/* Brand Slider */}
            {brands.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="relative z-10 w-full overflow-hidden py-12"
                >
                    {/* "Trusted by" Text */}
                    <div className="text-center mb-8">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            {trustedByText}
                        </span>
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                    {/* Scrolling Brands */}
                    <motion.div
                        className="flex items-center gap-20 pl-20"
                        animate={{
                            x: [0, -(brands.length * 200)],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: brands.length * 5,
                                ease: "linear",
                            },
                        }}
                    >
                        {/* Duplicate brands for seamless loop */}
                        {[...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0 w-[120px]"
                            >
                                {brand.logo}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
