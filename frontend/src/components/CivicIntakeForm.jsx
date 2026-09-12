import React, { useState } from 'react';
import { Camera, Send, AlertCircle, X, MapPin } from 'lucide-react';
import MapPicker from './MapPicker';
import { API_URL } from '../lib/api';

const ISSUE_OPTIONS = [
  { id: 'garbage', label: 'Solid Waste / Garbage Overflow' },
  { id: 'pothole', label: 'Road Pothole / Crater' },
  { id: 'water', label: 'Water Supply Outage / Contamination' },
  { id: 'sewage', label: 'Sewage / Gutter Manhole Overflow' },
  { id: 'electricity', label: 'Power Blackout / Transformer Fault' },
  { id: 'streetlight', label: 'Defective / Dark Streetlight' },
];

const KARACHI_AREAS = [
  'Korangi',
  'Clifton',
  'Saddar',
  'Gulshan-e-Iqbal',
  'DHA',
  'North Nazimabad',
  'Malir',
];

export default function CivicIntakeForm({ onReportSubmitted }) {
  const [issueType, setIssueType] = useState('garbage');
  const [area, setArea] = useState('Korangi');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState([24.8415, 67.1350]); // Default Korangi
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
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg('Please describe the civic issue in at least a few words.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      issue_type: issueType,
      area: area,
      description: description,
      lat: position ? position[0] : null,
      lng: position ? position[1] : null,
      photo_base64: photoBase64,
    };

    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      onReportSubmitted({
        ...data,
        description,
        area,
        issue_type: issueType,
        lat: position?.[0],
        lng: position?.[1],
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit report. Please verify backend is online.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ledger-panel" onSubmit={handleSubmit}>
      <div className="ledger-panel-header">
        <div>
          <h2>Register Civic Grievance</h2>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Karachi Municipal Jurisdictional Registry
          </span>
        </div>
        <span className="stamp-verified" style={{ transform: 'none' }}>
          MUNICIPAL INTAKE
        </span>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(166, 67, 43, 0.08)', border: '1px solid var(--flag)', borderRadius: 'var(--radius-sm)', color: 'var(--flag)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Row 1: Issue Type & Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Issue Category</label>
          <select className="form-select" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            {ISSUE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Karachi Sector / Area</label>
          <select className="form-select" value={area} onChange={(e) => setArea(e.target.value)}>
            {KARACHI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Location Map Picker */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} />
          Pinpoint Hazard Coordinates (OpenStreetMap)
        </label>
        <MapPicker
          position={position}
          setPosition={setPosition}
          onAreaChange={(detectedArea) => setArea(detectedArea)}
        />
      </div>

      {/* Row 3: Description */}
      <div className="form-group">
        <label className="form-label">Grievance Description & Landmark Details</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail (e.g. Unattended garbage heap piling up outside Sector 15 near Brookes Chowrangi for the past 4 days, blocking road access...)"
          required
        />
      </div>

      {/* Row 4: Photo Upload (Optional) */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Camera size={14} />
          Attach Photo Evidence (Multimodal Vision Analysis)
        </label>

        {photoPreview ? (
          <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
            <img
              src={photoPreview}
              alt="Hazard evidence preview"
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

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
        <span className="mono-num text-muted" style={{ fontSize: '0.8rem' }}>
          Verification: authority_mandates + pg_trgm dedup
        </span>
        <button type="submit" className="btn" disabled={submitting}>
          <Send size={15} />
          {submitting ? 'Registering & Routing...' : 'Submit Grievance to Ledger'}
        </button>
      </div>
    </form>
  );
}
