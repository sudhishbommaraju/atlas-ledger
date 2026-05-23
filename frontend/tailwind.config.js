/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Dark background scale ──────────────────
        base:    '#0B0D12',
        raised:  '#0F1115',
        surface: '#111317',
        elevated:'#151820',
        high:    '#1A1E26',
        // ── Borders ───────────────────────────────
        line:    '#1E2330',
        'line-2':'#252C38',
        'line-3':'#2E3444',
        // ── Typography (warm off-white scale) ─────
        chalk:   '#EDE8DF',   // primary
        silver:  '#B8B2AA',   // secondary
        stone:   '#6A6560',   // tertiary
        dust:    '#3A3830',   // ghost
        // ── Gold accent ───────────────────────────
        gold:    '#C6A66B',
        'gold-hi':'#D4B87A',
        'gold-lo':'#B89B5E',
        'gold-dim':'#A88B52',
        // ── Operational sage (positive) ───────────
        sage:    '#6B9E86',
        'sage-hi':'#8BBFAC',
        'sage-dim':'#4A7260',
        // ── Amber (warning/pending) ───────────────
        amber:   '#B8784A',
        'amber-dim':'#8C5A34',
        // ── Scarlet (blocked/error) ───────────────
        scarlet: '#A84A42',
        'scarlet-dim':'#7C342E',
      },
      borderRadius: {
        window: '24px',
        panel:  '16px',
        card:   '14px',
        btn:    '12px',
        pill:   '8px',
        tag:    '6px',
      },
      fontFamily: {
        inter: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.63rem', { lineHeight: '1rem' }],
        '3xs': ['0.56rem', { lineHeight: '0.9rem' }],
      },
      letterSpacing: {
        widest: '0.18em',
        ultra:  '0.24em',
      },
      animation: {
        marquee:    'marquee 55s linear infinite',
        'pulse-soft':'pulseSoft 3s ease-in-out infinite',
        breathe:    'breathe 4s ease-in-out infinite',
        'float-up': 'floatUp 0.45s ease-out forwards',
        'scan-down':'scanDown 8s linear infinite',
      },
      keyframes: {
        marquee:   { '0%':{ transform:'translateX(0%)'},   '100%':{ transform:'translateX(-50%)' } },
        pulseSoft: { '0%,100%':{ opacity:0.9 }, '50%':{ opacity:0.3 } },
        breathe:   { '0%,100%':{ opacity:0.6 }, '50%':{ opacity:1 } },
        floatUp:   { '0%':{ opacity:0, transform:'translateY(8px)' }, '100%':{ opacity:1, transform:'translateY(0)' } },
        scanDown:  { '0%':{ transform:'translateY(-100%)' }, '100%':{ transform:'translateY(400%)' } },
      },
    },
  },
  plugins: [],
}
