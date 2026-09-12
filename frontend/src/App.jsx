import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ModeSelector from './components/ModeSelector';
import CivicIntakeForm from './components/CivicIntakeForm';
import ReportReceipt from './components/ReportReceipt';
import BillAuditForm from './components/BillAuditForm';
import BillAuditReceipt from './components/BillAuditReceipt';
import ProcedureGuideView from './components/ProcedureGuideView';
import PublicDashboardView from './components/PublicDashboardView';
import { fetchHealth, API_URL } from './lib/api';
import { isSupabaseConfigured } from './lib/supabase';
import { Zap, BookOpen, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState('civic_issue');
  const [backendOnline, setBackendOnline] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [activeBill, setActiveBill] = useState(null);

  useEffect(() => {
    fetchHealth().then((data) => {
      setBackendOnline(data?.status === 'online');
    });
  }, []);

  // Poll active report status until drafted or confirmed
  useEffect(() => {
    if (!activeReport?.tracking_id) return;
    if (activeReport.status === 'drafted' || activeReport.status === 'confirmed_duplicate') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/reports/${activeReport.tracking_id}`);
        if (res.ok) {
          const updated = await res.json();
          if (updated.status === 'drafted' || updated.status === 'confirmed_duplicate') {
            setActiveReport(updated);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeReport]);

  // Poll active bill status until verdict is finalized
  useEffect(() => {
    if (!activeBill?.tracking_id) return;
    if (activeBill.verdict && activeBill.verdict !== 'verifying') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/bills/${activeBill.tracking_id}`);
        if (res.ok) {
          const updated = await res.json();
          if (updated.verdict && updated.verdict !== 'verifying') {
            setActiveBill(updated);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn('Bill polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeBill]);

  return (
    <div className="ledger-container">
      {/* Masthead */}
      <Navbar backendOnline={backendOnline} />

      {/* Pitch Demo Presets Toolbar (For Hackathon Judges) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.45rem 0.75rem',
          background: '#FFFFFF',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
        }}
      >
        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--ink)' }}>
          Pitch Demo Presets:
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setCurrentMode('civic_issue');
              setActiveReport({
                tracking_id: 'KOR-2026-0042',
                area: 'Korangi',
                issue_type: 'garbage',
                confirm_count: 4,
                status: 'drafted',
                matched_authority: {
                  authority_name: 'Sindh Solid Waste Management Board (SSWMB) - District Korangi',
                  contact_info: 'Helpline: 1128 | WhatsApp: +92-300-0501128',
                },
                drafted_complaint: 'STATUTORY CIVIC COMPLAINT\nDate: 10 March 2026\nTo: Managing Director, Sindh Solid Waste Management Board (SSWMB)\nAuthority Mandate: Sindh Solid Waste Management Board Act 2014, Section 8\nSubject: Critical Solid Waste Spillover at Sector 7-A, Korangi Industrial Area\n\nRespected Officer,\n\nWe hereby bring to your statutory attention severe municipal solid waste accumulation at Sector 7-A, Korangi Industrial Area. The uncollected waste obstructs commercial traffic and poses acute health hazards. Under Section 8 of the SSWMB Act 2014, lifting and municipal disposal is the statutory duty of your office.\n\nDemanded Actions:\n1. Immediate dispatch of compaction vehicles and sanitation crews.\n2. Placement of secondary garbage container bins.\n\nخلاصہ برائے فیلڈ انسپکٹر:\nکورنگی انڈسٹریل ایریا سیکٹر 7-اے میں کچرے کے ڈھیر سے ٹریفک معطل اور تعفن پھیل رہا ہے۔ سندھ سالڈ ویسٹ مینجمنٹ بورڈ ایکٹ 2014 کے تحت فوری صفائی عملہ روانہ کیا جائے۔\n\nSincerely,\nCorroborating Citizens of Korangi\nTracking ID: KOR-2026-0042'
              });
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
          >
            Scenario 1: Korangi Waste (SSWMB)
          </button>

          <button
            onClick={() => {
              setCurrentMode('billing_verify');
              setActiveBill({
                tracking_id: 'KE-2026-8812',
                provider: 'K-Electric',
                tariff_category: 'Residential-Unprotected',
                units_billed: 312,
                amount_billed: 14850,
                amount_expected: 10724,
                verdict: 'flagged',
                overcharge_pct: 38,
                math_breakdown: {
                  units_billed: 312,
                  tariff_category: 'Residential-Unprotected',
                  energy_charges: 8392.5,
                  fixed_charges: 400.0,
                  electricity_duty: 131.89,
                  tv_fee: 35.0,
                  gst: 1582.65,
                  total_expected: 10724.0,
                  amount_billed: 14850.0,
                  discrepancy: 4126.0,
                  overcharge_pct: 38.5,
                  slab_breakdown: [
                    { slab: '1 - 100', units: 100, rate: 16.48, cost: 1648.0 },
                    { slab: '101 - 200', units: 100, rate: 22.95, cost: 2295.0 },
                    { slab: '201 - 300', units: 100, rate: 27.14, cost: 2714.0 },
                    { slab: '301 - 400', units: 12, rate: 32.03, cost: 384.36 },
                  ]
                },
                drafted_complaint: 'FORMAL BILLING DISPUTE NOTICE\nUnder NEPRA Consumer Service Manual (CSM) Clause 11\nTo: Billing Dispute Resolution Cell, K-Electric Limited\nRe: Unauthorized Overcharge on 312 Units (Tracking: KE-2026-8812)\n\nAudit reveals statutory charges of Rs. 10,724 versus billed amount of Rs. 14,850, representing an unauthorized overbilling of Rs. 4,126.\n\nخلاصہ برائے صارفین تنازعات سیل:\nنیپرا کے منظور شدہ ٹیرف شیڈول کے مطابق 312 یونٹس پر اصل بل 10,724 روپے بنتا ہے جبکہ کے-الیکٹرک نے غیر قانونی طور پر 14,850 روپے بل کیا ہے۔ 4,126 روپے کا اضافی بل فوری طور پر درست کیا جائے۔\n\nTracking ID: KE-2026-8812'
              });
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
          >
            Scenario 2: KE Overcharge (+Rs. 4,126)
          </button>

          <button
            onClick={() => {
              setCurrentMode('procedure_guide');
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
          >
            Scenario 3: Anti-Hallucination Procedures
          </button>

          <button
            onClick={() => {
              setCurrentMode('public_dashboard');
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'var(--ink)', color: '#FFFFFF' }}
          >
            Scenario 4: Live Public Register
          </button>
        </div>
      </div>

      {/* Mode Selector (4 Public Ledger functional buttons) */}
      <ModeSelector currentMode={currentMode} onSelectMode={setCurrentMode} />

      {/* Main Content Pane */}
      {currentMode === 'civic_issue' && (
        activeReport ? (
          <ReportReceipt
            report={activeReport}
            onReset={() => setActiveReport(null)}
          />
        ) : (
          <CivicIntakeForm onReportSubmitted={(rep) => setActiveReport(rep)} />
        )
      )}

      {currentMode === 'billing_verify' && (
        activeBill ? (
          <BillAuditReceipt
            bill={activeBill}
            onReset={() => setActiveBill(null)}
          />
        ) : (
          <BillAuditForm onBillSubmitted={(b) => setActiveBill(b)} />
        )
      )}

      {currentMode === 'procedure_guide' && (
        <ProcedureGuideView />
      )}

      {currentMode === 'public_dashboard' && (
        <PublicDashboardView />
      )}

      {/* Public Register Live Feed (displayed when on intake tabs) */}
      {currentMode !== 'public_dashboard' && (
        <section className="ledger-panel">
          <div className="ledger-panel-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Public Evidence Register — Karachi</h3>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Latest verified municipal complaints and citizen corroborations
              </span>
            </div>
            <button
              onClick={() => setCurrentMode('public_dashboard')}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
            >
              Open Full Dashboard →
            </button>
          </div>

        <div style={{ borderTop: '1px solid var(--line)' }}>
          <div className="ledger-row">
            <span className="tracking-id" style={{ fontWeight: 600 }}>KOR-2026-0042</span>
            <div>
              <strong>Solid Waste & Open Dump · Korangi Industrial Area</strong>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                Assigned to Sindh Solid Waste Management Board (SSWMB) · Helpline: 1128
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="mono-num text-verified" style={{ fontSize: '0.85rem' }}>
                ⊙ 4 confirmed
              </span>
              <span className="stamp-verified">DRAFTED</span>
            </div>
          </div>

          <div className="ledger-row">
            <span className="tracking-id" style={{ fontWeight: 600 }}>CLI-2026-1189</span>
            <div>
              <strong>Burst Water Main & Saline Contamination · Clifton Block 8</strong>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                Assigned to Cantonment Board Clifton (CBC) Water Branch / KWSC · 1072
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="mono-num text-verified" style={{ fontSize: '0.85rem' }}>
                ⊙ 2 confirmed
              </span>
              <span className="stamp-verified">DRAFTED</span>
            </div>
          </div>

          <div className="ledger-row">
            <span className="tracking-id" style={{ fontWeight: 600 }}>SAD-2026-0931</span>
            <div>
              <strong>Deep Road Crater & Subsidence · Saddar Preedy Street</strong>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                Assigned to Karachi Metropolitan Corporation (KMC) Works · 1334
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="mono-num text-verified" style={{ fontSize: '0.85rem' }}>
                ⊙ 7 confirmed
              </span>
              <span className="stamp-verified">DRAFTED</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          Nigraan — Verification Before Generation · Architecture Over App
        </div>
        <div className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
          FastAPI + LangGraph · React Vite · Supabase
        </div>
      </footer>
    </div>
  );
}
