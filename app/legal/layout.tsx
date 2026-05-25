'use client';

import Link from 'next/link';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];

  return (
    <div style={{
      background: c.bg,
      color: c.text,
      minHeight: '100vh',
      fontFamily: tokens.fonts.body,
    }}>
      {/* Back nav */}
      <div style={{
        borderBottom: `1px solid ${c.border}`,
        padding: '16px 32px',
      }}>
        <Link href="/" style={{
          fontSize: '13px',
          color: c.textSecondary,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ← Back to Atlas
        </Link>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '48px 32px 80px',
        lineHeight: '1.75',
        fontSize: '15px',
      }}>
        <style>{`
          .legal-content h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; color: ${c.text}; }
          .legal-content h2 { font-size: 20px; font-weight: 700; margin: 40px 0 12px 0; color: ${c.text}; }
          .legal-content h3 { font-size: 16px; font-weight: 700; margin: 28px 0 8px 0; color: ${c.text}; }
          .legal-content h4 { font-size: 14px; font-weight: 600; margin: 20px 0 6px 0; color: ${c.text}; }
          .legal-content p { margin: 0 0 14px 0; color: ${c.textSecondary}; }
          .legal-content ul, .legal-content ol { margin: 0 0 14px 0; padding-left: 22px; color: ${c.textSecondary}; }
          .legal-content li { margin-bottom: 6px; }
          .legal-content strong { font-weight: 600; color: ${c.text}; }
          .legal-content a { color: ${c.primary}; text-decoration: none; }
          .legal-content a:hover { text-decoration: underline; }
          .legal-content code { background: ${c.bgAlt}; border: 1px solid ${c.border}; padding: 2px 6px; border-radius: 4px; font-family: ${tokens.fonts.mono}; font-size: 13px; }
          .legal-content hr { border: none; border-top: 1px solid ${c.border}; margin: 32px 0; }
          .legal-content > p:first-child { color: ${c.textTertiary}; font-size: 13px; margin-bottom: 32px; }
        `}</style>
        <div className="legal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
