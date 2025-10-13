import React, { useEffect } from "react";

/* Creates a glowing cursor dot and applies tilt on elements with .tilt-on-cursor */
export default function CursorGlow() {
  useEffect(() => {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    Object.assign(dot.style, {
      position: "fixed",
      width: "18px",
      height: "18px",
      borderRadius: "999px",
      pointerEvents: "none",
      zIndex: 9999,
      transform: "translate(-50%, -50%)",
      boxShadow: "0 0 16px rgba(124,58,237,0.7), 0 0 30px rgba(192,132,252,0.12)",
      background: "linear-gradient(135deg,#7C3AED,#C084FC)",
      mixBlendMode: "screen",
    });
    document.body.appendChild(dot);

    function onMove(e) {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      // tilt interactive cards
      document.querySelectorAll(".tilt-on-cursor").forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        el.style.transform = `perspective(800px) rotateX(${(-dy * 6)}deg) rotateY(${(dx * 6)}deg) translateY(-6px)`;
      });
    }
    function onLeave() {
      document.querySelectorAll(".tilt-on-cursor").forEach(el => { el.style.transform = ""; });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      dot.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return null;
}
