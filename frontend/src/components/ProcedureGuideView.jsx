import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckSquare,
  Square,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  Send,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { fetchProcedures, submitExploitationSignal, API_URL } from '../lib/api';

const TUNNEL_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export default function ProcedureGuideView() {
  const [procedures, setProcedures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gateNotice, setGateNotice] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [loading, setLoading] = useState(true);

  // Exploitation signal modal state
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [signalAmount, setSignalAmount] = useState('');
  const [signalNote, setSignalNote] = useState('');
  const [signalSubmitting, setSignalSubmitting] = useState(false);
  const [signalSuccess, setSignalSuccess] = useState(false);

  // Load procedures from backend / Supabase
  useEffect(() => {
    const loadProcedures = async () => {
      try {
        const data = await fetchProcedures();
        if (data && data.length > 0) {
          setProcedures(data);
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.warn('Error fetching procedures:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProcedures();
  }, []);

  const activeProcedure = procedures.find((p) => p.id === selectedId) || procedures[0];

  const handleDocToggle = (docName) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGateNotice(null);

    try {
      const res = await fetch(`${API_URL}/api/procedures/lookup`, {
        method: 'POST',
        headers: TUNNEL_HEADERS,
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'uncovered') {
          setGateNotice(data.notice || 'Procedure not covered yet.');
        } else if (data.procedure) {
          // If matched, find in list or select it
          const existing = procedures.find((p) => p.id === data.procedure.id);
          if (existing) {
            setSelectedId(existing.id);
          } else {
            setProcedures((prev) => [data.procedure, ...prev]);
            setSelectedId(data.procedure.id);
          }
        }
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignalSubmit = async (e) => {
    e.preventDefault();
    setSignalSubmitting(true);

    try {
      await submitExploitationSignal({
        procedure_id: activeProcedure?.id,
        reported_amount: signalAmount ? parseFloat(signalAmount) : null,
        note: signalNote,
      });

      setSignalSuccess(true);
      setTimeout(() => {
        setShowSignalModal(false);
        setSignalSuccess(false);
        setSignalAmount('');
        setSignalNote('');
      }, 2000);
    } catch (err) {
      alert('Failed to submit signal. Please try again.');
    } finally {
      setSignalSubmitting(false);
    }
  };

  const totalDocs = activeProcedure?.required_documents?.length || 0;
  const gatheredDocsCount = activeProcedure?.required_documents?.filter(
    (d) => checkedDocs[d.document_name]
  ).length || 0;
  const progressPct = totalDocs > 0 ? Math.round((gatheredDocsCount / totalDocs) * 100) : 0;

  return (
    <div>
      {/* Search & Anti-Hallucination Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search any procedure (e.g. NADRA CNIC, Sindh Domicile, Passport, Driving License)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            color="var(--muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
        <button type="submit" className="btn btn-outline" disabled={isSearching}>
          {isSearching ? 'Auditing Gazette...' : 'Verify Procedure'}
        </button>
      </form>

      {/* Constraint Gate Notification (When procedure is unverified) */}
      {gateNotice && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(166, 67, 43, 0.08)',
            border: '1px solid var(--flag)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color="var(--flag)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--flag)', fontSize: '0.95rem' }}>
              Anti-Hallucination Gate Triggered: Record Not Verified for Karachi
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink)', marginTop: '0.25rem', lineHeight: '1.5' }}>
              {gateNotice}
            </p>
          </div>
          <button
            onClick={() => setGateNotice(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Quick Procedure Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {procedures.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setGateNotice(null);
              }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 600 : 400,
                padding: '0.5rem 1rem',
                border: isSelected ? '2px solid var(--ink)' : '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {activeProcedure ? (
        <div className="ledger-panel">
          {/* Procedure Header */}
          <div className="ledger-panel-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <span className="mono-num text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {activeProcedure.category || 'Statutory Civil Process'}
              </span>
              <h2 style={{ marginTop: '0.2rem' }}>{activeProcedure.name}</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
                {activeProcedure.description}
              </p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
              <div className="stamp-verified">
                <ShieldCheck size={13} />
                VERIFIED RECORD
              </div>
              <span className="mono-num text-muted" style={{ fontSize: '0.75rem' }}>
                As of: {activeProcedure.last_verified_at}
              </span>
              <a
                href={activeProcedure.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  color: 'var(--ink)',
                  textDecoration: 'underline',
                }}
              >
                Official Gazette Portal
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Section 1: Interactive Document Checklist */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Required Sourced Documents Checklist</h3>
              <span className="mono-num text-muted" style={{ fontSize: '0.85rem' }}>
                {gatheredDocsCount} of {totalDocs} Prepared ({progressPct}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: '6px',
                background: 'rgba(20, 33, 61, 0.08)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? 'var(--verified)' : 'var(--ink)',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>

            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
              {activeProcedure.required_documents?.map((doc, idx) => {
                const isChecked = Boolean(checkedDocs[doc.document_name]);
                return (
                  <div
                    key={doc.id || idx}
                    onClick={() => handleDocToggle(doc.document_name)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderBottom: idx === activeProcedure.required_documents.length - 1 ? 'none' : '1px solid var(--line)',
                      cursor: 'pointer',
                      background: isChecked ? 'rgba(47, 111, 78, 0.03)' : '#FFFFFF',
                    }}
                  >
                    <div style={{ marginTop: '0.15rem' }}>
                      {isChecked ? (
                        <CheckSquare size={18} color="var(--verified)" />
                      ) : (
                        <Square size={18} color="var(--muted)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong
                          style={{
                            fontSize: '0.9rem',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            color: isChecked ? 'var(--muted)' : 'var(--ink)',
                          }}
                        >
                          {doc.document_name}
                        </strong>
                        {doc.is_mandatory ? (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              border: '1px solid var(--ink)',
                              padding: '0.1rem 0.35rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 600,
                            }}
                          >
                            MANDATORY
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            OPTIONAL / CONDITIONAL
                          </span>
                        )}
                      </div>
                      {doc.notes && (
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Sequential Roadmap Steps */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem' }}>Official Sequence of Steps</h3>
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
              {activeProcedure.roadmap_steps?.map((step, idx) => (
                <div
                  key={step.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr auto',
                    gap: '1rem',
                    padding: '0.9rem 1rem',
                    borderBottom: idx === activeProcedure.roadmap_steps.length - 1 ? 'none' : '1px solid var(--line)',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="mono-num"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      width: '32px',
                      height: '32px',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(20, 33, 61, 0.02)',
                    }}
                  >
                    {step.step_order < 10 ? `0${step.step_order}` : step.step_order}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: '1.45' }}>
                    {step.description}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="mono-num text-muted"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        border: '1px solid var(--line)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF',
                      }}
                    >
                      <Clock size={12} />
                      {step.estimated_duration || 'Approx. 15 mins'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Facilitation Centers & Mega Offices */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem' }}>Designated Karachi Facilitation Centers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {activeProcedure.authorities?.map((auth, idx) => (
                <div
                  key={auth.id || idx}
                  style={{
                    border: '1px solid var(--line)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FFFFFF',
                  }}
                >
                  <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{auth.office_name}</strong>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                    {auth.address}
                  </div>
                  <div className="mono-num text-muted" style={{ fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} />
                    {auth.hours_text || 'Open 24 Hours'}
                  </div>
                  {auth.contact_info && (
                    <div className="mono-num" style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} />
                      {auth.contact_info}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Defense: Exploitation Signal Trigger */}
          <div
            style={{
              borderTop: '1px solid var(--line)',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Citizen Protection Hotline</div>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                Encountered unauthorized middleman charges, bribery, or counter extortion at this office?
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => setShowSignalModal(true)}>
              <AlertTriangle size={15} color="var(--flag)" />
              Report Extortion Demand
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--line)' }}>
          <p className="text-muted">Loading official procedures register...</p>
        </div>
      )}

      {/* Anonymous Exploitation Signal Modal */}
      {showSignalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--ink)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Log Anonymous Exploitation Signal</h3>
                <span className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
                  Procedure: {activeProcedure?.name}
                </span>
              </div>
              <button
                onClick={() => setShowSignalModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: '0.75rem',
                background: 'rgba(20, 33, 61, 0.03)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                color: 'var(--muted)',
              }}
            >
              <strong>Strictly Anonymous (§9 Risk Directives):</strong> No name, phone, or citizen identity is recorded. This submission writes directly to public aggregate pressure metrics on the Karachi civic dashboard.
            </div>

            {signalSuccess ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--verified)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 600 }}>Signal Recorded in Public Ledger!</div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Aggregate metric updated. Thank you for building systemic pressure.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSignalSubmit}>
                <div className="form-group">
                  <label className="form-label">Unlawful Amount Demanded (Rs.) — Optional</label>
                  <input
                    type="number"
                    className="form-input mono-num"
                    placeholder="e.g. 2000"
                    value={signalAmount}
                    onChange={(e) => setSignalAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Description / Middleman Location</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe what occurred (e.g. Agent standing outside Gate 2 demanding Rs. 2,000 for token queue jumping; counter clerk asking for cash unreceipted fee...)"
                    value={signalNote}
                    onChange={(e) => setSignalNote(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowSignalModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={signalSubmitting}>
                    <Send size={14} />
                    {signalSubmitting ? 'Recording...' : 'Submit Anonymous Signal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
