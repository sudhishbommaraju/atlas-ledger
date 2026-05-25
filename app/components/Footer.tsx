'use client';

import Link from 'next/link';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export function Footer() {
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];

  const linkStyle = {
    fontSize: '13px',
    color: c.textSecondary,
    textDecoration: 'none' as const,
  };

  return (
    <footer style={{
      background: c.bgAlt,
      borderTop: `1px solid ${c.border}`,
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.xl}`,
      marginTop: tokens.spacing['2xl'],
      fontFamily: tokens.fonts.body,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: tokens.spacing['2xl'],
          marginBottom: tokens.spacing['2xl'],
        }}>
          {/* Brand */}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: tokens.spacing.md }}>
              Atlas
            </div>
            <p style={{ fontSize: '13px', color: c.textSecondary, lineHeight: '1.6', margin: 0 }}>
              Continuous operational control layer for payout-heavy companies.
            </p>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: c.textTertiary, marginBottom: tokens.spacing.md }}>
              Product
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing.sm }}>
              <li><Link href="/" style={linkStyle}>What We Do</Link></li>
              <li><Link href="/security" style={linkStyle}>Security</Link></li>
              <li><Link href="/faq" style={linkStyle}>FAQ</Link></li>
              <li><Link href="/auth/password" style={linkStyle}>Live Demo</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: c.textTertiary, marginBottom: tokens.spacing.md }}>
              Company
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing.sm }}>
              <li><Link href="/waitlist" style={linkStyle}>Join Waitlist</Link></li>
              <li><a href="mailto:hello@atlas.ai" style={linkStyle}>Contact</a></li>
              <li><a href="https://twitter.com/getAtlas" target="_blank" rel="noopener noreferrer" style={linkStyle}>Twitter</a></li>
              <li><a href="https://linkedin.com/company/atlas-ai" target="_blank" rel="noopener noreferrer" style={linkStyle}>LinkedIn</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: c.textTertiary, marginBottom: tokens.spacing.md }}>
              Legal
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing.sm }}>
              <li><Link href="/legal/terms-of-service" style={linkStyle}>Terms of Service</Link></li>
              <li><Link href="/legal/privacy-policy" style={linkStyle}>Privacy Policy</Link></li>
              <li><a href="mailto:legal@atlas.ai" style={linkStyle}>Legal Inquiry</a></li>
              <li><a href="mailto:privacy@atlas.ai" style={linkStyle}>Privacy Questions</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${c.border}`,
          paddingTop: tokens.spacing.xl,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing.lg,
        }}>
          <p style={{ fontSize: '12px', color: c.textTertiary, margin: 0 }}>
            © 2026 Atlas. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: tokens.spacing.lg }}>
            <a href="mailto:security@atlas.ai" style={{ fontSize: '12px', color: c.textTertiary, textDecoration: 'none' }}>
              Report Security Issue
            </a>
            <a href="mailto:legal@atlas.ai" style={{ fontSize: '12px', color: c.textTertiary, textDecoration: 'none' }}>
              Legal Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
