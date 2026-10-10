import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getCategoryBadgeClass, formatDate } from '../utils/formatters';

// Category color map for markers (strictly non-neon, elegant muted palette)
const CATEGORY_COLORS = {
  FLOOD: '#1d4ed8',       // Maritime blue
  FIRE: '#b91c1c',        // Crimson red
  MEDICAL: '#9f1239',     // Rose ruby
  EARTHQUAKE: '#b45309',  // Bronze amber
  TRAPPED: '#6d28d9',     // Purple
  SEARCH_RESCUE: '#6d28d9',
  VIOLENCE: '#831843',    // Deep rose
  OTHER: '#475569',       // Slate
};

export default function SosMapView({ messages, onInspect, focusedSos }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not yet initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.23, 76.40],
        zoom: 12,
        zoomControl: true,
      });

      // Add 100% free OpenStreetMap tile layer (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const validMessages = messages.filter(
      (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number'
    );

    const bounds = [];

    validMessages.forEach((msg) => {
      const lat = msg.latitude;
      const lng = msg.longitude;
      bounds.push([lat, lng]);

      const catColor = CATEGORY_COLORS[msg.emergencyCategory?.toUpperCase()] || '#475569';

      // Create a clean custom circular marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${catColor};
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
          ">
            <span>!</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      const popupHtml = `
        <div style="font-family: var(--font-sans); padding: 4px; max-width: 230px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              font-size: 11px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              background: ${catColor}15;
              color: ${catColor};
              border: 1px solid ${catColor}40;
            ">
              ${msg.emergencyCategory || 'EMERGENCY'}
            </span>
            <span style="font-size: 10px; color: #64748b; font-weight: 600;">
              ${msg.deliveryStatus || 'PENDING'}
            </span>
          </div>
          <p style="font-size: 12px; margin: 4px 0 6px 0; color: #0f172a; line-height: 1.35;">
            ${msg.description || 'No descriptive payload'}
          </p>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <div><strong>Device:</strong> ${msg.senderDeviceId || 'Unknown'}</div>
            <div><strong>GPS:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            <div><strong>Time:</strong> ${formatDate(msg.createdAt)}</div>
          </div>
          <button 
            id="popup-inspect-btn-${msg.id || msg._id}" 
            style="
              width: 100%;
              padding: 4px 8px;
              font-size: 11px;
              font-weight: 600;
              background: #0f172a;
              color: #ffffff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            View Incident Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-inspect-btn-${msg.id || msg._id}`);
        if (btn) {
          btn.onclick = () => onInspect(msg);
        }
      });
    });

    // Auto-fit to markers bounds if any exist
    if (bounds.length > 0) {
      if (focusedSos && typeof focusedSos.latitude === 'number') {
        map.setView([focusedSos.latitude, focusedSos.longitude], 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    return () => {
      // Map stays attached to ref until unmounted
    };
  }, [messages, focusedSos, onInspect]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-view-wrapper">
      <div ref={mapContainerRef} className="map-container" />
      
      {/* Muted Clean Legend */}
      <div className="map-legend">
        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>Incident Categories</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ color: '#475569', fontSize: '11px' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
