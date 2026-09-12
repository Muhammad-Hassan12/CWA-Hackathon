import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export default function Navbar({ backendOnline }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="ledger-header" style={{ marginBottom: '1.5rem' }}>
      <div className="ledger-brand">
        <h1>Nigraan (نگران)</h1>
        <div className="ledger-tagline">
          Civic Intelligence Copilot · Public Ledger Architecture · Karachi
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="mono-num text-muted" style={{ fontSize: '0.85rem' }}>
            {currentDate}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: backendOnline ? 'var(--verified)' : 'var(--flag)',
            }}
          >
            <Activity size={13} />
            {backendOnline ? 'Orchestrator Online' : 'Orchestrator Connecting'}
          </span>
        </div>
        <div className="stamp-verified" title="Every claim backed by official mandate or gazette">
          <ShieldCheck size={13} />
          Verified Register
        </div>
      </div>
    </header>
  );
}
