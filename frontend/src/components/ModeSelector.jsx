import React from 'react';
import { AlertTriangle, Receipt, BookOpen, BarChart3 } from 'lucide-react';

export default function ModeSelector({ currentMode, onSelectMode }) {
  const modes = [
    {
      id: 'civic_issue',
      label: 'Report a Civic Issue',
      desc: 'Garbage, potholes, water, sewage, electric outages with verified municipal mandate',
      icon: AlertTriangle,
    },
    {
      id: 'billing_verify',
      label: 'Check Utility Bill',
      desc: 'Recompute K-Electric / SSGC bill slab-by-slab from published NEPRA tariffs',
      icon: Receipt,
    },
    {
      id: 'procedure_guide',
      label: 'Official Procedures',
      desc: 'NADRA CNIC, Sindh Domicile, and Driving License checklists from dated official records',
      icon: BookOpen,
    },
    {
      id: 'public_dashboard',
      label: 'Public Ledger & Live Feed',
      desc: 'Realtime municipal accountability register, overcharge totals, and universal tracking',
      icon: BarChart3,
    },
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                border: isActive ? '2px solid var(--ink)' : '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>
                  {m.label}
                </span>
                <Icon size={16} color={isActive ? 'var(--ink)' : 'var(--muted)'} />
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
