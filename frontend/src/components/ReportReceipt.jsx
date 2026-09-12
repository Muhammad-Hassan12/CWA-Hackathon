import React, { useState } from 'react';
import {
  Check,
  Copy,
  ShieldCheck,
  ArrowLeft,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import AgentTraceModal from './AgentTraceModal';
import FormattedDocument from './FormattedDocument';
import { markReportResolved } from '../lib/api';
import { formatDraftText, stripMarkdownAsterisks } from '../lib/formatText';

export default function ReportReceipt({ report, onReset }) {
  const [copied, setCopied] = useState(false);
  const [complaintCopied, setComplaintCopied] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState(
    report.status === 'resolved_self_reported' ? 'resolved_self_reported' : null
  );

  const copyTrackingId = () => {
    navigator.clipboard.writeText(report.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanComplaint = formatDraftText(report.drafted_complaint);

  const copyComplaint = () => {
    if (cleanComplaint) {
      navigator.clipboard.writeText(stripMarkdownAsterisks(cleanComplaint));
      setComplaintCopied(true);
      setTimeout(() => setComplaintCopied(false), 2000);
    }
  };

  const handleMarkResolved = async () => {
    if (resolvedStatus === 'resolved_self_reported') return;
    setIsResolving(true);
    try {
      const res = await markReportResolved(report.tracking_id);
      if (res && res.success) {
        setResolvedStatus('resolved_self_reported');
      }
    } catch (err) {
      console.warn('Error marking report resolved:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const currentStatus = resolvedStatus || report.status || 'submitted';

  return (
    <div className="ledger-panel">
      <div className="ledger-panel-header">
        <div>
          <h2>Civic Complaint Registered</h2>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Official Public Register Receipt
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
          <div className="stamp-verified">
            <ShieldCheck size={14} />
            MANDATE VERIFIED
          </div>
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
            Permanent Tracking Identifier
          </div>
          <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--ink)' }}>
            {report.tracking_id}
          </div>
        </div>
        <button className="btn btn-outline" onClick={copyTrackingId}>
          {copied ? <Check size={15} color="var(--verified)" /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy ID'}
        </button>
      </div>

      {/* Grid of Report Facts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>CIVIC SECTOR</div>
          <strong style={{ fontSize: '0.95rem' }}>{report.area}, Karachi</strong>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>CLASSIFIED HAZARD</div>
          <strong style={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>
            {report.issue_type || 'General Municipal Issue'}
          </strong>
        </div>

        <div style={{ border: '1px solid var(--line)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>PUBLIC EVIDENCE</div>
          <strong className="mono-num" style={{ fontSize: '0.95rem', color: 'var(--verified)' }}>
            ⊙ {report.confirm_count || 1} confirmed citizen(s)
          </strong>
        </div>
      </div>

      {/* Matched Authority Mandate */}
      {report.matched_authority && (() => {
        const authName = (report.matched_authority.authority_name || '').toLowerCase();
        let portalUrl = 'https://sindh.gov.pk';
        if (authName.includes('sswmb') || authName.includes('solid waste')) portalUrl = 'https://sswmb.gos.pk';
        else if (authName.includes('kwsc') || authName.includes('kwsb') || authName.includes('water')) portalUrl = 'https://www.kwsc.gos.pk';
        else if (authName.includes('kmc') || authName.includes('metropolitan')) portalUrl = 'https://kmc.gos.pk';
        else if (authName.includes('cbc') || authName.includes('cantonment')) portalUrl = 'https://cbc.gov.pk';
        else if (authName.includes('electric') || authName.includes('ke')) portalUrl = 'https://www.ke.com.pk';

        return (
          <div style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Building2 size={16} color="var(--ink)" />
                  <strong style={{ fontSize: '0.9rem' }}>Jurisdictional Authority Mandated:</strong>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
                  {report.matched_authority.authority_name}
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {report.matched_authority.contact_info}
                </div>
              </div>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem',
                  color: 'var(--ink)',
                  textDecoration: 'underline',
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--paper)',
                }}
              >
                Official Authority Portal
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        );
      })()}

      {/* Drafted Complaint or Processing Status */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <strong style={{ fontSize: '0.95rem' }}>Official Complaint Document (English & خلاصہ برائے فیلڈ انسپکٹر)</strong>
          {report.drafted_complaint && (
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={copyComplaint}>
              {complaintCopied ? <Check size={13} color="var(--verified)" /> : <Copy size={13} />}
              {complaintCopied ? 'Copied Text' : 'Copy Complaint'}
            </button>
          )}
        </div>

        {cleanComplaint ? (
          <FormattedDocument text={cleanComplaint} />
        ) : (
          <div style={{ border: '1px solid var(--line)', padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={24} color="var(--muted)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600 }}>Agent Orchestrator Verification in Progress</div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              LangGraph is evaluating mandate rules, verifying area coordinates, and drafting the bilingual complaint with critique validation...
            </p>
          </div>
        )}
      </div>

      {/* Citizen Self-Reported Resolution Section (§7 Phase 6 & §8) */}
      <div
        style={{
          border: '1px solid var(--line)',
          background: currentStatus === 'resolved_self_reported' ? 'rgba(47, 111, 78, 0.04)' : 'var(--paper)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>
              Has this municipal issue been rectified on site?
            </strong>
            <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', maxWidth: '540px' }}>
              {currentStatus === 'resolved_self_reported'
                ? 'Marked as rectified by citizen. This record is registered on the Public Ledger as citizen self-reported.'
                : 'Closing the loop: Citizens can mark an issue resolved once municipal teams clear the area.'}
            </p>
          </div>

          {currentStatus === 'resolved_self_reported' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="stamp-verified" style={{ transform: 'none' }}>
                <CheckCircle2 size={13} />
                RESOLVED (SELF-REPORTED)
              </span>
            </div>
          ) : (
            <button
              onClick={handleMarkResolved}
              disabled={isResolving}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', borderColor: 'var(--verified)', color: 'var(--verified)' }}
            >
              <CheckCircle2 size={14} />
              {isResolving ? 'Updating Ledger...' : 'Mark as Resolved (Citizen Self-Report)'}
            </button>
          )}
        </div>

        {/* Mandatory Transparency Disclosure */}
        <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--line)', fontSize: '0.73rem', color: 'var(--muted)' }}>
          <strong>Statutory Disclosure (§6):</strong> This resolution status is self-reported by the citizen; it is not an official closure certificate issued by the municipal corporation.
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
        <button className="btn btn-outline" onClick={onReset}>
          <ArrowLeft size={15} />
          File Another Grievance
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
            Status: {currentStatus}
          </span>
        </div>
      </div>

      {/* LangGraph Agent Trace Inspector Modal */}
      {showTraceModal && (
        <AgentTraceModal
          trackingId={report.tracking_id}
          mode="civic_issue"
          data={report}
          onClose={() => setShowTraceModal(false)}
        />
      )}
    </div>
  );
}
