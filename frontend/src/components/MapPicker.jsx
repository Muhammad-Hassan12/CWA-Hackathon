import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icon issue in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const KARACHI_AREAS = [
  { name: 'Korangi', lat: 24.8415, lng: 67.1350 },
  { name: 'Clifton', lat: 24.8290, lng: 67.0345 },
  { name: 'Saddar', lat: 24.8569, lng: 67.0182 },
  { name: 'Gulshan-e-Iqbal', lat: 24.9080, lng: 67.0750 },
  { name: 'DHA', lat: 24.8050, lng: 67.0550 },
  { name: 'North Nazimabad', lat: 24.9452, lng: 67.0544 },
  { name: 'Malir', lat: 24.8900, lng: 67.2000 },
];

function findClosestArea(lat, lng) {
  let closest = KARACHI_AREAS[0].name;
  let minDist = Infinity;
  for (const a of KARACHI_AREAS) {
    const dist = Math.hypot(a.lat - lat, a.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = a.name;
    }
  }
  return closest;
}

function LocationMarker({ position, setPosition, onAreaChange }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      const matchedArea = findClosestArea(e.latlng.lat, e.latlng.lng);
      if (onAreaChange) {
        onAreaChange(matchedArea);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ position, setPosition, onAreaChange }) {
  const center = position || [24.8607, 67.0011];
  const [tileError, setTileError] = useState(false);

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#F4F1EA' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => {
                setTileError(true);
              },
            }}
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onAreaChange={onAreaChange}
          />
        </MapContainer>

        {tileError && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.72rem',
              color: 'var(--muted)',
              zIndex: 1000,
            }}
          >
            Offline tile cache active · Click anywhere to place coordinate pin
          </div>
        )}
      </div>
      <div style={{ padding: '0.4rem 0.75rem', background: '#FFFFFF', borderTop: '1px solid var(--line)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
        <span className="text-muted">Click map to pin precise hazard coordinates</span>
        {position && (
          <span className="mono-num" style={{ color: 'var(--ink)' }}>
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}
