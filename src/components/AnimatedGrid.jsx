import React from "react";

export default function AnimatedGrid(){
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#7C3AED" stopOpacity="0.12" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
      </svg>
    </div>
  );
}
