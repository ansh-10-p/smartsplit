/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Instrument Serif', 'serif'],
        'sans': ['Quicksand', 'sans-serif'],
      },
      colors: {
        galactic: {
          900: "#050214",
          800: "#0a0028",
          700: "#120434",
          600: "#2b0a5a"
        },
        neonPurple: "#7C3AED",
        magenta: "#C084FC",
        aqua: "#10B981",
        cyanGlow: "#00FFF5"
      },
      boxShadow: {
        'neon-lg': '0 8px 40px rgba(124,58,237,0.18), 0 0 40px rgba(192,132,252,0.06)'
      },
      keyframes: {
        floaty: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        slowpulse: 'pulse 6s infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
