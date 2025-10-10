import { motion } from "framer-motion";

export default function GradientBackground() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-purple-800 opacity-90"
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 20, repeat: Infinity }}
      style={{
        backgroundSize: "200% 200%",
      }}
    />
  );
}
