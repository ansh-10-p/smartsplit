import React, { useEffect } from "react";

/* small cursor glow + tilt effect on elements with .tilt-on-cursor */
export default function CursorGlow(){
  useEffect(()=>{
    const cursor = document.createElement("div");
    cursor.className = "cursor-dot";
    document.body.appendChild(cursor);

    function onMove(e){
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";

      document.querySelectorAll(".tilt-on-cursor").forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        el.style.transform = `perspective(800px) rotateX(${(-dy*6)}deg) rotateY(${(dx*6)}deg) translateY(-2px)`;
      });
    }

    function onLeave(){
      document.querySelectorAll(".tilt-on-cursor").forEach(el => el.style.transform = "");
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cursor.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return null;
}
