"use client";
import { useState, useEffect } from "react";

export default function DemoPasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const expectedPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Atlas2016!";

  useEffect(() => {
    const auth = localStorage.getItem("atlas_demo_auth");
    if (auth === expectedPassword) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [expectedPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      localStorage.setItem("atlas_demo_auth", password);
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F4EE]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1D4ED8]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F4EE] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[rgba(11,18,32,0.08)] p-8 shadow-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-[#1D4ED8]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1220] tracking-tight">Protected Demo</h1>
            <p className="text-sm text-[#5B6472] mt-2">
              Please enter the demo password to view the continuous payout integrity dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password-gate" className="block text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password-gate"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F7F4EE]/50 border border-[rgba(11,18,32,0.1)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition"
                required
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0B1220] hover:bg-[#1D4ED8] text-white font-medium rounded-xl text-sm transition-colors duration-200"
            >
              Access Demo
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
