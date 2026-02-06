import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = ({
    className,
    testimonials,
    duration = 10,
}) => {
    return (
        <div className={className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2)].map((_, index) => (
                    <React.Fragment key={index}>
                        {testimonials.map(({ text, image, name, role }, i) => (
                            <div
                                className="p-10 rounded-3xl border shadow-lg shadow-purple-900/10 dark:shadow-purple-900/20 max-w-xs w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                key={i}
                            >
                                <div className="text-slate-700 dark:text-slate-300">{text}</div>
                                <div className="flex items-center gap-2 mt-5">
                                    <img
                                        width={40}
                                        height={40}
                                        src={image}
                                        alt={name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-medium tracking-tight leading-5 text-slate-900 dark:text-slate-100">
                                            {name}
                                        </div>
                                        <div className="leading-5 opacity-60 tracking-tight text-slate-500 dark:text-slate-400">
                                            {role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};
