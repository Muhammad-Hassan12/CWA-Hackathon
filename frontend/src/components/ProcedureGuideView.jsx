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

const INITIAL_PROCEDURES = [
  {
    id: 'cnic-renewal',
    name: 'CNIC Renewal (NADRA)',
    category: 'Identity & Civil Status',
    description: 'Official standard and urgent renewal of Computerized National Identity Cards (CNIC) / Smart National Identity Cards (SNIC) for Pakistani citizens residing in Karachi.',
    last_verified_at: '2026-01-15',
    source_url: 'https://www.nadra.gov.pk/identity/identity-cnic/',
    required_documents: [
      {
        id: 'doc-cnic-1',
        document_name: 'Original Expired CNIC / SNIC',
        notes: 'Must be handed over for punching/cancellation upon collection of new card',
        is_mandatory: true,
      },
      {
        id: 'doc-cnic-2',
        document_name: 'Photocopy of Parent or Spouse CNIC',
        notes: 'Used for computerized biometric cross-verification with NADRA database',
        is_mandatory: true,
      },
      {
        id: 'doc-cnic-3',
        document_name: 'Proof of Address Update (Utility bill or Registered Tenancy / Lease Agreement)',
        notes: 'Only mandatory if your permanent or current residential address is being updated',
        is_mandatory: false,
      },
      {
        id: 'doc-cnic-4',
        document_name: 'Marriage Certificate / Nikkahnama (for married females updating status)',
        notes: 'Mandatory if updating marital status from single to married',
        is_mandatory: false,
      },
    ],
    authorities: [
      {
        id: 'auth-cnic-1',
        office_name: 'NADRA Mega Center DHA Phase 4',
        address: 'Main Korangi Road, Phase 4, Defence Housing Authority, Karachi',
        hours_text: 'Open 24 Hours / 7 Days a week',
        contact_info: 'Helpline: 1777 (mobile) | +92-51-111-786-100',
      },
      {
        id: 'auth-cnic-2',
        office_name: 'NADRA Mega Center North Nazimabad',
        address: 'Block L, Near Sakhi Hassan Chowrangi, North Nazimabad, Karachi',
        hours_text: 'Open 24 Hours / 7 Days a week',
        contact_info: 'Helpline: 1777',
      },
      {
        id: 'auth-cnic-3',
        office_name: 'NADRA Mega Center Siemens Chowrangi',
        address: 'Estate Avenue, SITE Area, Near Siemens Chowrangi, Karachi',
        hours_text: 'Open 24 Hours / 7 Days a week',
        contact_info: 'Helpline: 1777',
      },
    ],
    roadmap_steps: [
      {
        id: 'step-cnic-1',
        step_order: 1,
        description: 'Token Issuance: Enter facility and receive electronic queue token from the computerized reception window.',
        estimated_duration: '5 mins',
      },
      {
        id: 'step-cnic-2',
        step_order: 2,
        description: 'Biometric Capture: Automated digital photograph, all ten fingerprints, and iris scan at designated booth.',
        estimated_duration: '8 mins',
      },
      {
        id: 'step-cnic-3',
        step_order: 3,
        description: 'Data Entry & Confirmation: Operator verifies personal details on bilingual screen. Review and sign printed draft form.',
        estimated_duration: '10 mins',
      },
      {
        id: 'step-cnic-4',
        step_order: 4,
        description: 'Attestation / Exemption: If both biometric scans match family tree, physical gazette attestation is waived. Otherwise, get form attested by Grade 17+ officer.',
        estimated_duration: 'Conditional',
      },
      {
        id: 'step-cnic-5',
        step_order: 5,
        description: 'Tracking Voucher Issuance: Receive stamped payment and tracking receipt containing your unique 11-digit NADRA tracking code.',
        estimated_duration: '2 mins',
      },
    ],
  },
  {
    id: 'sindh-domicile',
    name: 'Sindh Domicile & PRC Certificate',
    category: 'Citizenship & Residence',
    description: 'Statutory issuance of Permanent Resident Certificate (PRC Form P-1) and Domicile Certificate by the Government of Sindh District Administration for admissions, exams, and government employment.',
    last_verified_at: '2026-02-01',
    source_url: 'https://commissionerkarachi.gos.pk/',
    required_documents: [
      {
        id: 'doc-dom-1',
        document_name: 'Original CNIC / Form-B of Applicant + 2 Attested Copies',
        notes: 'Attested by Grade 17+ Government Gazette Officer',
        is_mandatory: true,
      },
      {
        id: 'doc-dom-2',
        document_name: 'Father / Guardian CNIC + Sindh Domicile & PRC Copy',
        notes: 'Mandatory to substantiate domicile by descent',
        is_mandatory: true,
      },
      {
        id: 'doc-dom-3',
        document_name: 'Five (5) Passport Size Photographs with White Background',
        notes: 'Two attested on front, two on reverse',
        is_mandatory: true,
      },
      {
        id: 'doc-dom-4',
        document_name: 'Educational Certificates (Matriculation Certificate / Marks Sheet)',
        notes: 'Showing school attended in Karachi to establish uninterrupted physical residence',
        is_mandatory: true,
      },
      {
        id: 'doc-dom-5',
        document_name: 'Recent Electricity or Sui Gas Utility Bill of Karachi Residence',
        notes: 'Bill from last 3 months bearing the residential address claimed in application',
        is_mandatory: true,
      },
      {
        id: 'doc-dom-6',
        document_name: 'Attested Stamp Paper Affidavit (Rs. 100/50)',
        notes: 'Declaring applicant does not possess domicile of any other district/province, signed before Oath Commissioner',
        is_mandatory: true,
      },
    ],
    authorities: [
      {
        id: 'auth-dom-1',
        office_name: 'Deputy Commissioner (DC) Office South',
        address: '4th Floor, Sindh Secretariat Building No. 2, Kamal Ataturk Road, Karachi',
        hours_text: 'Monday - Friday, 09:00 AM - 04:00 PM',
        contact_info: 'Phone: +92-21-99208000 | Email: dc.south@sindh.gov.pk',
      },
      {
        id: 'auth-dom-2',
        office_name: 'Deputy Commissioner (DC) Office Korangi',
        address: 'Sector 31-D, Near Bilal Chowrangi, Korangi Industrial Area, Karachi',
        hours_text: 'Monday - Friday, 09:00 AM - 04:00 PM',
        contact_info: 'Phone: +92-21-99333900 | Email: dc.korangi@sindh.gov.pk',
      },
      {
        id: 'auth-dom-3',
        office_name: 'Deputy Commissioner (DC) Office East',
        address: 'Block 14, Gulshan-e-Iqbal, Near Civic Center, Karachi',
        hours_text: 'Monday - Friday, 09:00 AM - 04:00 PM',
        contact_info: 'Phone: +92-21-99230555',
      },
    ],
    roadmap_steps: [
      {
        id: 'step-dom-1',
        step_order: 1,
        description: 'Affidavit Attestation & File Preparation: Purchase official Domicile file docket and print statutory affidavit on Rs. 100 legal stamp paper. Sign in presence of Oath Commissioner.',
        estimated_duration: '30-45 mins',
      },
      {
        id: 'step-dom-2',
        step_order: 2,
        description: 'Assistant Commissioner (AC) Endorsement: Visit the Assistant Commissioner sub-division office for preliminary document verification and signature on Form P-1.',
        estimated_duration: '1-2 business days',
      },
      {
        id: 'step-dom-3',
        step_order: 3,
        description: 'DC Citizen Facilitation Counter Submission: Submit verified file with fee payment challan (NBP official fee Rs 200) at Deputy Commissioner Citizen Service Window.',
        estimated_duration: '30 mins',
      },
      {
        id: 'step-dom-4',
        step_order: 4,
        description: 'Police Verification & Administrative Background Check: Verification and final DC seal signature.',
        estimated_duration: '3-5 business days',
      },
      {
        id: 'step-dom-5',
        step_order: 5,
        description: 'Collection: Collect original sealed green Domicile Certificate and PRC Form P-1 upon presenting stamped submission voucher.',
        estimated_duration: '5 mins',
      },
    ],
  },
  {
    id: 'driving-license',
    name: 'Driving License Renewal (Sindh Police)',
    category: 'Transport & Licensing',
    description: 'Official statutory renewal process for non-commercial (Motorcycle / Motorcar M/Car) computerized driving licenses issued by the Sindh Police Driving License Branch.',
    last_verified_at: '2026-02-10',
    source_url: 'https://dls.sindhpolice.gov.pk/',
    required_documents: [
      {
        id: 'doc-lic-1',
        document_name: 'Original Expired Driving License',
        notes: 'Must be surrendered or physically inspected by licensing authority',
        is_mandatory: true,
      },
      {
        id: 'doc-lic-2',
        document_name: 'Valid Original CNIC + 2 Attested Photocopies',
        notes: 'Must show Karachi residential address or Sindh address',
        is_mandatory: true,
      },
      {
        id: 'doc-lic-3',
        document_name: 'Medical Fitness Certificate (Form B)',
        notes: 'Mandatory for drivers aged 50+; issued by on-site Sindh Police medical doctor',
        is_mandatory: true,
      },
      {
        id: 'doc-lic-4',
        document_name: 'Three (3) Passport Size Photographs',
        notes: 'Passport size with light blue or white background',
        is_mandatory: true,
      },
    ],
    authorities: [
      {
        id: 'auth-lic-1',
        office_name: 'Sindh Police Driving License Branch Clifton',
        address: 'Khayaban-e-Roomi, Block 8, Clifton, Near Do Talwar, Karachi',
        hours_text: 'Monday - Saturday, 08:30 AM - 03:30 PM (Friday break 1-2 PM)',
        contact_info: 'Helpline: 1915 | Phone: +92-21-99250524',
      },
      {
        id: 'auth-lic-2',
        office_name: 'Sindh Police Driving License Branch Nazimabad',
        address: 'Block 7, Subzi Mandi Road, Nazimabad, Karachi',
        hours_text: 'Monday - Saturday, 08:30 AM - 03:30 PM',
        contact_info: 'Phone: +92-21-99260566',
      },
      {
        id: 'auth-lic-3',
        office_name: 'Sindh Police Driving License Branch Korangi',
        address: 'Sector 31-D, Korangi Industrial Area, Near Brooks Chowrangi, Karachi',
        hours_text: 'Monday - Saturday, 08:30 AM - 03:30 PM',
        contact_info: 'Phone: +92-21-35050555',
      },
    ],
    roadmap_steps: [
      {
        id: 'step-lic-1',
        step_order: 1,
        description: 'Physical Token & Medical Window: Present original expired license and CNIC at reception. Undergo on-site eye & basic physical fitness examination.',
        estimated_duration: '15 mins',
      },
      {
        id: 'step-lic-2',
        step_order: 2,
        description: 'Biometrics & Digital Signature: High-resolution digital photograph, digital signature tablet capture, and fingerprint scan.',
        estimated_duration: '10 mins',
      },
      {
        id: 'step-lic-3',
        step_order: 3,
        description: 'Government Fee Payment: Pay official statutory fee (3-year or 5-year renewal challan) at on-site National Bank of Pakistan branch booth.',
        estimated_duration: '10 mins',
      },
      {
        id: 'step-lic-4',
        step_order: 4,
        description: 'Voucher & Urgent Delivery: Receive computerized stamped payment slip which serves as a valid 30-day provisional driving permit.',
        estimated_duration: '5 mins',
      },
    ],
  },
];

export default function ProcedureGuideView() {
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES);
  const [selectedId, setSelectedId] = useState('cnic-renewal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [gateNotice, setGateNotice] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [loading, setLoading] = useState(false);

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
          if (!selectedId) setSelectedId(data[0].id);
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
