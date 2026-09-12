import React, { useState } from 'react';
import { Camera, Zap, AlertCircle, X, Calculator } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function BillAuditForm({ onBillSubmitted }) {
  const [provider, setProvider] = useState('K-Electric');
  const [tariffCategory, setTariffCategory] = useState('Residential-Unprotected');
  const [units, setUnits] = useState('320');
  const [amountBilled, setAmountBilled] = useState('12000');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      provider: provider,
      tariff_category: tariffCategory,
      units_billed: units ? parseFloat(units) : null,
      amount_billed: amountBilled ? parseFloat(amountBilled) : null,
      photo_base64: photoBase64,
    };

    try {
      const res = await fetch(`${API_URL}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      onBillSubmitted({
        ...data,
        provider,
        tariff_category: tariffCategory,
        units_billed: parseFloat(units),
        amount_billed: parseFloat(amountBilled),
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit bill. Please verify backend is online.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ledger-panel" onSubmit={handleSubmit}>
      <div className="ledger-panel-header">
        <div>
          <h2>Utility Bill Audit & Tariff Verification</h2>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Karachi NEPRA / SSGC Statutory Recomputation
          </span>
        </div>
        <span className="stamp-verified" style={{ transform: 'none' }}>
          DETERMINISTIC MATH
        </span>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(166, 67, 43, 0.08)', border: '1px solid var(--flag)', borderRadius: 'var(--radius-sm)', color: 'var(--flag)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Row 1: Provider & Tariff Class */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Utility Provider</label>
          <select className="form-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="K-Electric">K-Electric (Electricity)</option>
            <option value="SSGC">Sui Southern Gas Company (SSGC)</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tariff Category</label>
          <select className="form-select" value={tariffCategory} onChange={(e) => setTariffCategory(e.target.value)}>
            <option value="Residential-Unprotected">Residential Unprotected (Standard Consumer)</option>
            <option value="Residential-Protected">Residential Protected (≤ 200 units, 6-mo history)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Photo Attachment (Multimodal extraction) */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Camera size={14} />
          Upload Bill Photo (Multimodal Vision Auto-Extract)
        </label>

        {photoPreview ? (
          <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
            <img
              src={photoPreview}
              alt="Bill photo preview"
              style={{ maxHeight: '140px', display: 'block', borderRadius: 'var(--radius-sm)' }}
            />
            <button
              type="button"
              onClick={removePhoto}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(20, 33, 61, 0.85)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="form-input"
            style={{ fontSize: '0.85rem' }}
          />
        )}
      </div>

      {/* Row 3: Manual Values / Override */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Units Consumed (kWh / Units)</label>
          <input
            type="number"
            className="form-input mono-num"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g. 320"
            required
            step="any"
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Amount Billed on Invoice (Rs.)</label>
          <input
            type="number"
            className="form-input mono-num"
            value={amountBilled}
            onChange={(e) => setAmountBilled(e.target.value)}
            placeholder="e.g. 12000"
            required
            step="any"
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
        <span className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
          Audit Rules: NEPRA Gazette + Electricity Duty 1.5% + GST 18%
        </span>
        <button type="submit" className="btn" disabled={submitting}>
          <Calculator size={15} />
          {submitting ? 'Recomputing Slabs...' : 'Audit Bill Against Gazette'}
        </button>
      </div>
    </form>
  );
}
