import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useCallback } from "react";

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export default function BackgroundSystem() {
  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 760);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 400);
  const smoothX = useSpring(mouseX, { stiffness: 20, damping: 34, mass: 1.9 });
  const smoothY = useSpring(mouseY, { stiffness: 20, damping: 34, mass: 1.9 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--ink)" }} />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(184,155,94,0.05) 0%, transparent 72%), radial-gradient(ellipse 50% 35% at 100% 100%, rgba(239,234,226,0.8) 0%, transparent 55%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(17,17,17,0.028) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(17,17,17,0.028) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, black 15%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 40%, black 15%, transparent 100%)",
        }}
      />

      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: smoothX,
          top: smoothY,
          width: 520,
          height: 520,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(184,155,94,0.04) 0%, rgba(247,245,242,0.02) 40%, transparent 72%)",
          filter: "blur(28px)",
          willChange: "left, top",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: noiseSvg,
          backgroundSize: "200px 200px",
          opacity: 0.035,
          mixBlendMode: "multiply",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 55%, rgba(17,17,17,0.025) 100%)",
        }}
      />
    </div>
  );
}
