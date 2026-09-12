import React, { useState } from 'react';
import { Check, Copy, ShieldCheck, AlertTriangle, ArrowLeft, Clock, GitBranch } from 'lucide-react';
import AgentTraceModal from './AgentTraceModal';

export default function BillAuditReceipt({ bill, onReset }) {
  const [copied, setCopied] = useState(false);
  const [disputeCopied, setDisputeCopied] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);

  const breakdown = bill.math_breakdown || {};
  const isFlagged = bill.verdict === 'flagged';
  const isProcessing = !bill.amount_expected && bill.verdict === 'verifying';
  // Derive discrepancy from math_breakdown when top-level field is absent (pre-polling state)
  const discrepancy = bill.discrepancy ?? breakdown.discrepancy ?? (
    (bill.amount_billed && bill.amount_expected)
      ? Math.max(0, bill.amount_billed - bill.amount_expected)
      : 0
  );

  const copyTrackingId = () => {
    navigator.clipboard.writeText(bill.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDispute = () => {
    if (bill.drafted_complaint) {
      navigator.clipboard.writeText(bill.drafted_complaint);
      setDisputeCopied(true);
      setTimeout(() => setDisputeCopied(false), 2000);
    }
  };

  return (
    <div className="ledger-panel">
      <div className="ledger-panel-header">
        <div>
          <h2>Utility Tariff Audit Verdict</h2>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            {bill.provider} · {bill.tariff_category}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowTraceModal(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
            title="Inspect internal LangGraph execution steps"
          >
            <GitBranch size={13} />
            Agent Trace
          </button>
          {isFlagged ? (
            <span className="badge-flag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}>
              <AlertTriangle size={14} />
              OVERCHARGE DETECTED (+{bill.overcharge_pct || breakdown.overcharge_pct || 0}%)
            </span>
          ) : isProcessing ? (
            <span className="mono-num text-muted" style={{ fontSize: '0.85rem' }}>
              Audit in progress...
            </span>
          ) : (
            <span className="stamp-verified">
              <ShieldCheck size={14} />
              VERIFIED ACCURATE
            </span>
          )}
        </div>
      </div>

      {/* Tracking ID Masthead */}
      <div
        style={{
          border: '1px solid var(--line)',
          background: 'rgba(20, 33, 61, 0.02)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Audit Record Reference
          </div>
          <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--ink)' }}>
            {bill.tracking_id}
          </div>
        </div>
        <button className="btn btn-outline" onClick={copyTrackingId}>
          {copied ? <Check size={15} color="var(--verified)" /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy ID'}
        </button>
      </div>

      {/* Summary Stat Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>UNITS CONSUMED</div>
          <strong className="mono-num" style={{ fontSize: '1.1rem' }}>{bill.units_billed || 0} kWh</strong>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>AMOUNT BILLED</div>
          <strong className="mono-num" style={{ fontSize: '1.1rem' }}>Rs. {(bill.amount_billed || 0).toLocaleString()}</strong>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>STATUTORY EXPECTED</div>
          <strong className="mono-num" style={{ fontSize: '1.1rem', color: isFlagged ? 'var(--flag)' : 'var(--verified)' }}>
            Rs. {(bill.amount_expected || breakdown.total_expected || 0).toLocaleString()}
          </strong>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>DISCREPANCY</div>
          <strong className="mono-num" style={{ fontSize: '1.1rem', color: isFlagged ? 'var(--flag)' : 'var(--verified)' }}>
            {isFlagged ? `+Rs. ${(discrepancy || 0).toLocaleString()}` : 'Rs. 0.00 (Within margin)'}
          </strong>
        </div>
      </div>

      {/* Itemized Public Ledger Math Breakdown */}
      {breakdown.slab_breakdown && breakdown.slab_breakdown.length > 0 ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Slab-by-Slab Mathematical Proof (NEPRA Schedule)</h3>
          
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(20, 33, 61, 0.04)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '0.65rem 1rem' }}>Consumption Slab</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Units</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Tariff Rate</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Calculated Amount</th>
                </tr>
              </thead>
              <tbody className="mono-num">
                {breakdown.slab_breakdown.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.55rem 1rem' }}>{s.slab}</td>
                    <td style={{ padding: '0.55rem 1rem', textAlign: 'right' }}>{s.units}</td>
                    <td style={{ padding: '0.55rem 1rem', textAlign: 'right' }}>Rs. {s.rate.toFixed(2)}</td>
                    <td style={{ padding: '0.55rem 1rem', textAlign: 'right' }}>Rs. {s.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}

                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                  <td colSpan={3} style={{ padding: '0.45rem 1rem' }}>Fixed Regulatory Charge</td>
                  <td style={{ padding: '0.45rem 1rem', textAlign: 'right' }}>Rs. {(breakdown.fixed_charge || 0).toFixed(2)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                  <td colSpan={3} style={{ padding: '0.45rem 1rem' }}>Electricity Duty (1.5%)</td>
                  <td style={{ padding: '0.45rem 1rem', textAlign: 'right' }}>Rs. {(breakdown.electricity_duty || 0).toFixed(2)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                  <td colSpan={3} style={{ padding: '0.45rem 1rem' }}>PTV License Fee</td>
                  <td style={{ padding: '0.45rem 1rem', textAlign: 'right' }}>Rs. {(breakdown.tv_fee || 35).toFixed(2)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                  <td colSpan={3} style={{ padding: '0.45rem 1rem' }}>General Sales Tax (18%)</td>
                  <td style={{ padding: '0.45rem 1rem', textAlign: 'right' }}>Rs. {(breakdown.gst || 0).toFixed(2)}</td>
                </tr>

                <tr style={{ background: 'rgba(20, 33, 61, 0.02)', fontWeight: 600, borderTop: '2px solid var(--ink)' }}>
                  <td colSpan={3} style={{ padding: '0.75rem 1rem' }}>TOTAL EXPECTED BILL (Statutory)</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: isFlagged ? 'var(--flag)' : 'var(--verified)' }}>
                    Rs. {(breakdown.total_expected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : isProcessing ? (
        <div style={{ border: '1px solid var(--line)', padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <Clock size={24} color="var(--muted)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontWeight: 600 }}>Deterministic Tariff Recomputation in Progress</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Computing units against NEPRA slab tiers and auditing statutory taxes...
          </p>
        </div>
      ) : null}

      {/* Drafted Legal Dispute Claim (if flagged) */}
      {isFlagged && bill.drafted_complaint && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.95rem' }}>NEPRA / IBC Billing Dispute Claim (Ready for Submission)</strong>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={copyDispute}>
              {disputeCopied ? <Check size={13} color="var(--verified)" /> : <Copy size={13} />}
              {disputeCopied ? 'Copied Claim' : 'Copy Dispute Claim'}
            </button>
          </div>

          <pre
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--line)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
            }}
          >
            {bill.drafted_complaint}
          </pre>
        </div>
      )}

      {/* Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
        <button className="btn btn-outline" onClick={onReset}>
          <ArrowLeft size={15} />
          Audit Another Bill
        </button>
        <span className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
          Source: NEPRA Official Gazette · Effective July 2024
        </span>
      </div>

      {showTraceModal && (
        <AgentTraceModal
          trackingId={bill.tracking_id}
          mode="billing_verify"
          data={bill}
          onClose={() => setShowTraceModal(false)}
        />
      )}
    </div>
  );
}
