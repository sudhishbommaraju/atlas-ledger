/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Tight", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#F7F5F2",
          2: "#F5F2ED",
          3: "#EFEAE2",
          4: "#FAF8F4",
        },
        void: {
          DEFAULT: "#0D1016",
          2: "#111317",
          3: "#151820",
          4: "#0B0D12",
        },
        accent: {
          DEFAULT: "#B89B5E",
          2: "#C6A66B",
          3: "#A88B52",
          4: "#D2B377",
          deep: "#8F7A4C",
        },
        sage: { DEFAULT: "#74806A", muted: "#6D7764" },
        verdict: {
          safe: "#738B6A",
          partial: "#A27B42",
          blocked: "#8B5E5E",
        },
      },
      boxShadow: {
        soft: "0 2px 12px rgba(17,17,17,0.04)",
        card: "0 4px 24px rgba(17,17,17,0.06)",
        product: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.45)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
