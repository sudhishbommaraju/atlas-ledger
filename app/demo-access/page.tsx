"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DemoAccessPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_DEMO_PASSWORD) {
      sessionStorage.setItem("atlas_demo_access", "true");
      window.location.href = "/demo";
    } else {
      setError("Incorrect password");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F4EE", padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: "1px solid rgba(11,18,32,0.10)",
          boxShadow: "0 12px 32px rgba(11,18,32,0.06)",
          borderRadius: 12,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#1D4ED8", marginBottom: 16 }}>
          ATLAS DEMO ACCESS
        </span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0B1220", marginBottom: 8, lineHeight: 1.2 }}>
          Enter demo access password.
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#5B6472", marginBottom: 32, lineHeight: 1.5 }}>
          The Atlas operational demo is available for invited users and pilot partners.
        </p>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
          >
            <input
              ref={inputRef}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 6,
                border: `1px solid ${error ? "#DC2626" : "rgba(11,18,32,0.10)"}`,
                background: "#FFFFFF",
                color: "#0B1220",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => (e.target.style.borderColor = error ? "#DC2626" : "#1D4ED8")}
              onBlur={(e) => (e.target.style.borderColor = error ? "#DC2626" : "rgba(11,18,32,0.10)")}
            />
            {error && (
              <span style={{ fontSize: "0.8rem", color: "#DC2626", textAlign: "left" }}>{error}</span>
            )}
          </motion.div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "12px", background: "#1D4ED8", color: "#FFFFFF", fontSize: "1rem", border: "none" }}
          >
            Access Demo
          </button>
        </form>

        <p style={{ fontSize: "0.75rem", color: "#5B6472", marginTop: 24 }}>
          Access is monitored and intended for evaluation purposes only.
        </p>
      </motion.div>
    </div>
  );
}
