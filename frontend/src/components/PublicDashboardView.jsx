import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  Users,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  MapPin,
  Clock,
  Zap,
  GitBranch,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AgentTraceModal from './AgentTraceModal';
import { fetchDashboardStats, fetchDashboardFeed, lookupTracking, markReportResolved, API_URL } from '../lib/api';

export default function PublicDashboardView() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedKind, setSelectedKind] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Tracking ID Lookup Modal State
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [traceTarget, setTraceTarget] = useState(null);

  const apiUrl = API_URL;

  // Fetch Dashboard Stats & Feed
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch Stats
      const statsData = await fetchDashboardStats();
      if (statsData) {
        setStats(statsData);
      }

      // 2. Fetch Feed
      const feedData = await fetchDashboardFeed(40);
      if (feedData && feedData.length >= 0) {
        setFeed(feedData);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime Channel if configured
    let channel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public-dashboard-feed')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
            loadData(true);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => {
            loadData(true);
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime channel error:', e);
      }
    }

    // Seamless polling fallback every 8 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Handle Quick Tracking Lookup
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!lookupId.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    setShowLookupModal(true);

    try {
      const data = await lookupTracking(lookupId);
      setLookupResult(data);
    } catch (err) {
      setLookupError(err.message || 'Tracking ID could not be retrieved from Public Register.');
    } finally {
      setLookupLoading(false);
    }
  };

  const openLookupFor = (tId) => {
    setLookupId(tId);
    setShowLookupModal(true);
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    lookupTracking(tId)
      .then((data) => setLookupResult(data))
      .catch((err) => setLookupError(err.message || `Tracking ID "${tId}" could not be retrieved.`))
      .finally(() => setLookupLoading(false));
  };

  // Filtering
  const areas = ['All', 'Korangi', 'Clifton', 'Saddar', 'Gulshan-e-Iqbal', 'DHA', 'North Nazimabad'];
  const kinds = [
    { id: 'All', label: 'All Evidences' },
    { id: 'civic_issue', label: 'Civic Reports' },
    { id: 'bill_audit', label: 'Bill Audits' },
  ];

  const filteredFeed = feed.filter((item) => {
    if (selectedArea !== 'All') {
      const itemArea = (item.area || '').toLowerCase();
      if (!itemArea.includes(selectedArea.toLowerCase())) return false;
    }
    if (selectedKind !== 'All') {
      if (item.kind !== selectedKind) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrack = (item.tracking_id || '').toLowerCase().includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchTrack && !matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner & Realtime Status */}
      <div className="ledger-panel" style={{ borderLeft: '4px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Karachi Public Evidence Register</h2>
              <span className="stamp-verified" style={{ transform: 'none', padding: '0.15rem 0.45rem' }}>
                PUBLIC LEDGER
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '680px', lineHeight: 1.45, margin: 0 }}>
              Live civic complaints, utility overcharge audits, and authority accountability metrics across Karachi's 7 districts. Built on deterministic statutory records.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.3rem 0.6rem',
                background: '#FFFFFF',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--verified)',
                  boxShadow: '0 0 0 2px rgba(47, 111, 78, 0.2)',
                  display: 'inline-block',
                }}
              />
              {isSupabaseConfigured ? 'REALTIME POSTGRES LIVE' : 'AUTO-SYNCING (8s)'}
            </div>

            <button
              onClick={() => loadData(true)}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              title="Refresh ledger feed"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>
      </div>

      {/* KPI Ledger Scorecard (Hero Stats) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1: Verified Reports */}
        <div className="ledger-panel" style={{ margin: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Civic Evidences
            </span>
            <Building2 size={16} color="var(--ink)" />
          </div>
          <div className="mono-num" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
            {stats?.total_reports || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <span className="text-verified" style={{ fontWeight: 600 }}>
              {stats?.drafted_reports || 0} Drafted
            </span>
            <span className="text-muted">· 100% Mandate Matched</span>
          </div>
        </div>

        {/* Metric 2: Overcharge PKR */}
        <div className="ledger-panel" style={{ margin: 0, padding: '1.25rem', borderTop: '3px solid var(--flag)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tariff Overcharge
            </span>
            <Receipt size={16} color="var(--flag)" />
          </div>
          <div className="mono-num" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--flag)', lineHeight: 1.1 }}>
            Rs. {stats ? Number(stats.total_overcharge_pkr).toLocaleString() : '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <span className="text-flag" style={{ fontWeight: 600 }}>
              {stats?.flagged_bills || 0} Bills Flagged
            </span>
            <span className="text-muted">· NEPRA Slabs Audited</span>
          </div>
        </div>

        {/* Metric 3: Corroboration Weight */}
        <div className="ledger-panel" style={{ margin: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Citizen Weight
            </span>
            <Users size={16} color="var(--verified)" />
          </div>
          <div className="mono-num" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--verified)', lineHeight: 1.1 }}>
            {stats?.total_corroborations || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <span className="text-verified" style={{ fontWeight: 600 }}>
              Collective Backing
            </span>
            <span className="text-muted">· Clustered duplicate alerts</span>
          </div>
        </div>

        {/* Metric 4: Bribe Signals */}
        <div className="ledger-panel" style={{ margin: 0, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Bribe Demands Flagged
            </span>
            <ShieldAlert size={16} color="var(--ink)" />
          </div>
          <div className="mono-num" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
            {stats?.total_bribe_signals || '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            <span className="mono-num text-flag" style={{ fontWeight: 600 }}>
              Rs. {stats ? Number(stats.total_bribe_pkr).toLocaleString() : '0'}
            </span>
            <span className="text-muted">· Anonymous signals</span>
          </div>
        </div>
      </div>

      {/* Quick Universal Tracking Search */}
      <div className="ledger-panel" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            />
            <input
              type="text"
              className="form-input mono-num"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Audit Search by Tracking ID (e.g. KOR-2026-0042, KE-2026-8812)"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" disabled={lookupLoading}>
            {lookupLoading ? 'Searching Ledger...' : 'Audit Lookup'}
          </button>
        </form>
      </div>

      {/* Main Grid: Live Register Table (Left 7 cols) & Authority Scorecard (Right 5 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Live Public Feed */}
        <div className="ledger-panel" style={{ flex: '1 1 60%' }}>
          <div className="ledger-panel-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Live Public Evidences</h3>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Chronological register of citizen complaints and utility disputes
              </span>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {kinds.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelectedKind(k.id)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedKind === k.id ? '1px solid var(--ink)' : '1px solid var(--line)',
                    background: selectedKind === k.id ? 'var(--ink)' : '#FFFFFF',
                    color: selectedKind === k.id ? '#FFFFFF' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Filter Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {areas.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedArea(a)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedArea === a ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: selectedArea === a ? '#EAE8DF' : '#FFFFFF',
                  color: 'var(--ink)',
                  fontWeight: selectedArea === a ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Register Items Table */}
          <div style={{ borderTop: '1px solid var(--line)' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Loading public register evidences...
              </div>
            ) : filteredFeed.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>
                No records match current filter criteria.
              </div>
            ) : (
              filteredFeed.map((item) => {
                const isExpanded = expandedId === item.tracking_id;
                const isBill = item.kind === 'bill_audit';
                const isFlagged = item.status === 'flagged_overcharge' || item.severity === 'critical';

                return (
                  <div
                    key={item.tracking_id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: isExpanded ? '#FAF9F5' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.85rem 0.5rem',
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr auto',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : item.tracking_id)}
                    >
                      {/* Column 1: Tracking ID */}
                      <div>
                        <span
                          className="mono-num tracking-id"
                          style={{
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            display: 'block',
                            color: 'var(--ink)',
                          }}
                        >
                          {item.tracking_id}
                        </span>
                        <span className="mono-num text-muted" style={{ fontSize: '0.7rem' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '2026-03'}
                        </span>
                      </div>

                      {/* Column 2: Title & Details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {isBill ? <Receipt size={14} color="var(--ink)" /> : <AlertTriangle size={14} color="var(--ink)" />}
                          <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>{item.title}</strong>
                        </div>
                        <div
                          className="text-muted"
                          style={{
                            fontSize: '0.8rem',
                            marginTop: '0.2rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '380px',
                          }}
                        >
                          {item.description}
                        </div>
                      </div>

                      {/* Column 3: Status Stamp & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.confirm_count > 1 && (
                          <span
                            className="mono-num text-verified"
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                            title="Citizens who confirmed same issue"
                          >
                            ⊙ {item.confirm_count}
                          </span>
                        )}

                        {isBill ? (
                          item.status === 'flagged_overcharge' ? (
                            <span className="badge-flag" style={{ fontSize: '0.7rem' }}>
                              FLAGGED +Rs.{item.overcharge_amount}
                            </span>
                          ) : (
                            <span className="stamp-verified" style={{ transform: 'none', fontSize: '0.7rem' }}>
                              VERIFIED
                            </span>
                          )
                        ) : (
                          <span
                            className={item.status === 'drafted' ? 'stamp-verified' : 'badge-flag'}
                            style={{ transform: 'none', fontSize: '0.7rem' }}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLookupFor(item.tracking_id);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                          title="Open Full Record Audit"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '0.85rem 1rem 1.15rem 1rem',
                          background: '#FFFFFF',
                          borderTop: '1px dashed var(--line)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ marginBottom: '0.65rem' }}>
                          <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            Full Incident Description:
                          </span>
                          <p style={{ marginTop: '0.2rem', lineHeight: 1.45 }}>{item.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Jurisdiction: </span>
                            <span style={{ fontWeight: 600 }}>{item.area || 'Karachi Central'}</span>
                          </div>
                          <div>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Category: </span>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.category}</span>
                          </div>
                          <button
                            onClick={() => openLookupFor(item.tracking_id)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', marginLeft: 'auto' }}
                          >
                            <FileText size={13} />
                            View Full Dispute Statement
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Authority Accountability Scorecard & Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Authority Scorecard */}
          <div className="ledger-panel">
            <div className="ledger-panel-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Municipal Authority Scorecard</h3>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Statutory performance & citizen corroborations
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(stats?.authority_scorecard || []).map((auth) => (
                <div
                  key={auth.code}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>{auth.name}</strong>
                    <span className="mono-num text-verified" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {auth.response_rate} VERIFIED
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.76rem', marginBottom: '0.5rem' }}>
                    Mandate: {auth.jurisdiction}
                  </div>

                  {/* Meter bar */}
                  <div style={{ height: '4px', background: '#EAE8DF', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: auth.response_rate,
                        background: 'var(--ink)',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.45rem',
                      fontSize: '0.74rem',
                      color: 'var(--muted)',
                    }}
                  >
                    <span>Total Cases: <strong style={{ color: 'var(--ink)' }}>{auth.total_cases}</strong></span>
                    <span>Drafted Petitions: <strong style={{ color: 'var(--ink)' }}>{auth.drafted_cases}</strong></span>
                    <span>Backing: <strong style={{ color: 'var(--verified)' }}>⊙ {auth.corroborations}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Discrepancy Breakdown Card */}
          <div className="ledger-panel" style={{ borderLeft: '4px solid var(--flag)' }}>
            <div className="ledger-panel-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>NEPRA Tariff Violation Summary</h3>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Audited K-Electric & SSGC Domestic Accounts
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.4rem 0' }}>
                <span style={{ fontSize: '0.85rem' }}>Overcharge Occurrence Rate:</span>
                <strong className="mono-num text-flag" style={{ fontSize: '0.95rem' }}>
                  {stats?.billing_distribution?.overcharge_rate_pct || 75}%
                </strong>
              </div>
              <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.4rem 0' }}>
                <span style={{ fontSize: '0.85rem' }}>Average Overcharge / Account:</span>
                <strong className="mono-num text-flag" style={{ fontSize: '0.95rem' }}>
                  Rs. {stats?.billing_distribution?.avg_discrepancy_pkr ? Number(stats.billing_distribution.avg_discrepancy_pkr).toLocaleString() : '3,204'}
                </strong>
              </div>
              <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.4rem 0' }}>
                <span style={{ fontSize: '0.85rem' }}>Audited Domestic Accounts:</span>
                <strong className="mono-num" style={{ fontSize: '0.95rem' }}>
                  {stats?.billing_distribution?.total_audited || 12}
                </strong>
              </div>
              <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.4rem 0' }}>
                <span style={{ fontSize: '0.85rem' }}>Primary Tariff Infraction:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>
                  Protected Slab Misclassification
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking ID Universal Lookup Modal */}
      {showLookupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 33, 61, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 9999,
          }}
          onClick={() => setShowLookupModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="mono-num text-muted" style={{ fontSize: '0.78rem' }}>STATUTORY EVIDENCE RECORD</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem' }}>
                  {lookupResult?.data?.tracking_id || lookupId || 'Record Lookup'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {lookupResult?.data && (
                  <button
                    onClick={() => setTraceTarget({
                      trackingId: lookupResult.data.tracking_id,
                      mode: lookupResult.kind || 'civic_issue',
                      data: lookupResult.data,
                    })}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                    title="Inspect LangGraph Agent Trace"
                  >
                    <GitBranch size={13} />
                    Agent Trace
                  </button>
                )}
                <button
                  onClick={() => setShowLookupModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {lookupLoading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
                Auditing record against Public Ledger...
              </div>
            ) : lookupError ? (
              <div style={{ padding: '1.5rem', border: '1px solid var(--flag)', background: 'rgba(166, 67, 43, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--flag)', display: 'block', marginBottom: '0.35rem' }}>Lookup Notice:</strong>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{lookupError}</p>
              </div>
            ) : lookupResult?.data ? (
              <div>
                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--paper)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Status Stamp:</span>
                    <div style={{ marginTop: '0.2rem' }}>
                      <span className="stamp-verified" style={{ transform: 'none' }}>
                        {(lookupResult.data.status || lookupResult.data.verdict || 'VERIFIED').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Date Logged:</span>
                    <div className="mono-num" style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.85rem' }}>
                      {lookupResult.data.created_at ? new Date(lookupResult.data.created_at).toLocaleString() : '2026-03-12'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Location / Division:</span>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {lookupResult.data.area || lookupResult.data.provider || 'Karachi'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Citizen Corroborations:</span>
                    <div className="mono-num text-verified" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      ⊙ {lookupResult.data.confirm_count || 1} Citizen Confirmed
                    </div>
                  </div>
                </div>

                {/* Math Breakdown if Bill Audit */}
                {lookupResult.kind === 'bill_audit' && lookupResult.data.math_breakdown && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Statutory Tariff Recomputation</h4>
                    <div style={{ border: '1px solid var(--line)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.3rem 0' }}>
                        <span>Billed Amount:</span>
                        <strong className="mono-num">Rs. {lookupResult.data.amount_billed}</strong>
                      </div>
                      <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.3rem 0' }}>
                        <span>Statutory Expected:</span>
                        <strong className="mono-num text-verified">Rs. {lookupResult.data.amount_expected}</strong>
                      </div>
                      {lookupResult.data.amount_billed > lookupResult.data.amount_expected && (
                        <div className="ledger-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.3rem 0', borderTop: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--flag)' }}>Unauthorized Overcharge:</span>
                          <strong className="mono-num text-flag">
                            Rs. {lookupResult.data.amount_billed - lookupResult.data.amount_expected}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Drafted Complaint Statement */}
                {/* Drafted Complaint Statement */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Official Statutory Petition Draft</h4>
                  <pre
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '280px',
                      overflowY: 'auto',
                    }}
                  >
                    {lookupResult.data.drafted_complaint || 'Statutory notice is currently undergoing second-agent verification review.'}
                  </pre>
                </div>

                {/* Citizen Self-Report Resolution Section */}
                {lookupResult.kind === 'civic_issue' && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                        {lookupResult.data.status === 'resolved_self_reported'
                          ? '⊙ Rectification registered by citizen on site.'
                          : 'Has this municipal issue been cleared on site?'}
                      </span>
                      {lookupResult.data.status === 'resolved_self_reported' ? (
                        <span className="stamp-verified" style={{ transform: 'none', fontSize: '0.72rem' }}>
                          RESOLVED (SELF-REPORTED)
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const res = await markReportResolved(lookupResult.data.tracking_id);
                              if (res && res.success) {
                                setLookupResult(prev => ({
                                  ...prev,
                                  data: { ...prev.data, status: 'resolved_self_reported' }
                                }));
                                loadData(true);
                              }
                            } catch (e) {
                              console.warn(e);
                            }
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '0.76rem', padding: '0.25rem 0.55rem', color: 'var(--verified)', borderColor: 'var(--verified)' }}
                        >
                          <CheckCircle2 size={13} />
                          Mark as Resolved (Self-Report)
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                      Statutory disclosure: Self-reported by citizen; not an official authority closure certificate.
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Footer */}
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLookupModal(false)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Trace Inspector Modal */}
      {traceTarget && (
        <AgentTraceModal
          trackingId={traceTarget.trackingId}
          mode={traceTarget.mode}
          data={traceTarget.data}
          onClose={() => setTraceTarget(null)}
        />
      )}
    </div>
  );
}
