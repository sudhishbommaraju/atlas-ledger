'use client';

import { useState } from 'react';
import { Header } from '@/app/components/Header';

export default function SetupPage() {
  const [stripeKey, setStripeKey] = useState('');
  const [stripeStatus, setStripeStatus] = useState('disconnected');
  const [stripeLoading, setStripeLoading] = useState(false);

  async function testStripe() {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/integrations/stripe/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: stripeKey })
      });
      const data = await res.json();
      setStripeStatus(data.success ? 'connected' : 'failed');
    } catch (err) {
      setStripeStatus('failed');
    }
    setStripeLoading(false);
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: '60px', padding: '40px 32px', maxWidth: '1000px', margin: '60px auto 0' }}>
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 700, margin: '0 0 16px 0', color: '#C9D1D9' }}>
            Connect Your Systems
          </h1>
          <p style={{ fontSize: '16px', color: '#8B949E', margin: 0, lineHeight: '1.6', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Atlas monitors your Stripe, bank, and ERP for payout drift. Your API keys are encrypted and secure.
          </p>
        </div>

        {/* Stripe Card */}
        <div style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          transition: 'all 0.2s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '28px' }}>💳</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#C9D1D9' }}>Stripe</h2>
          </div>
          
          <p style={{ color: '#8B949E', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            Read your payout settlements and balance in real time from Stripe.
          </p>

          <div style={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#6E7681', margin: '0 0 8px 0', fontWeight: 500 }}>How to get your API key:</p>
            <ol style={{ fontSize: '12px', color: '#8B949E', margin: 0, paddingLeft: '20px' }}>
              <li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" style={{ color: '#79c0ff' }}>stripe.com/developers</a></li>
              <li>Click "API Keys"</li>
              <li>Copy your Secret Key (sk_test_...)</li>
            </ol>
          </div>

          <input
            type="password"
            placeholder="sk_test_..."
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#0D1117',
              border: '1px solid #30363D',
              borderRadius: '8px',
              color: '#C9D1D9',
              fontSize: '13px',
              marginBottom: '16px',
              boxSizing: 'border-box',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
            onBlur={(e) => e.target.style.borderColor = '#30363D'}
          />

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={testStripe}
              disabled={stripeLoading}
              style={{
                padding: '10px 20px',
                background: stripeStatus === 'connected' ? '#1D9E75' : '#1F6FEB',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: stripeLoading ? 'wait' : 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {stripeLoading ? 'Testing...' : stripeStatus === 'connected' ? '✓ Connected' : 'Test Connection'}
            </button>
            <a href="https://stripe.com/docs/api" target="_blank" style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#79c0ff',
              border: '1px solid #30363D',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              View Docs →
            </a>
          </div>

          <div style={{ fontSize: '12px', color: stripeStatus === 'connected' ? '#1D9E75' : stripeStatus === 'failed' ? '#DA3633' : '#6E7681' }}>
            {stripeStatus === 'connected' && '✓ Connected to Stripe'}
            {stripeStatus === 'failed' && '✗ Failed to connect'}
            {stripeStatus === 'disconnected' && 'Not yet connected'}
          </div>
        </div>

        {/* Bank Card (Coming Soon) */}
        <div style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          opacity: 0.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>🏦</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#C9D1D9' }}>Bank (Plaid)</h2>
            </div>
            <div style={{ background: '#BA7517', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Coming Soon</div>
          </div>
          <p style={{ color: '#8B949E', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            Connect your bank to read confirmed balances. Plaid securely handles your login.
          </p>
        </div>

        {/* ERP Card (Coming Soon) */}
        <div style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '40px',
          opacity: 0.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>📊</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#C9D1D9' }}>ERP (NetSuite)</h2>
            </div>
            <div style={{ background: '#BA7517', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Coming Soon</div>
          </div>
          <p style={{ color: '#8B949E', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            Connect your ERP to read balances and payout eligibility.
          </p>
        </div>

        {/* Status Summary */}
        {stripeStatus === 'connected' && (
          <div style={{
            background: '#161B22',
            border: '2px solid #1D9E75',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1D9E75', marginBottom: '8px' }}>Atlas is Ready</h3>
            <p style={{ color: '#8B949E', marginBottom: '24px' }}>Stripe is connected. Atlas is monitoring your operations.</p>
            <a href="/dashboard" style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#1F6FEB',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              Go to Dashboard →
            </a>
          </div>
        )}
      </div>
    </>
  );
}
