import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Activity, 
  MapPin, 
  Radio, 
  ShieldCheck, 
  BatteryCharging, 
  WifiOff, 
  Layers, 
  ExternalLink,
  Users
} from 'lucide-react';

export default function CommunitySidebarRight({
  messages,
  onOpenFullMap,
  onFocusMap,
}) {
  const miniMapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const activeCount = messages.filter(
    (m) => m.deliveryStatus !== 'RESOLVED' && m.deliveryStatus !== 'DELIVERED'
  ).length;

  const resolvedCount = messages.filter(
    (m) => m.deliveryStatus === 'RESOLVED' || m.deliveryStatus === 'DELIVERED'
  ).length;

  const uniqueNodes = new Set(messages.map((m) => m.senderDeviceId).filter(Boolean)).size;

  // Initialize mini preview map
  useEffect(() => {
    if (!miniMapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(miniMapRef.current, {
        center: [10.23, 76.40],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Add recent coordinates
    const validWithCoords = messages.filter(
      (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number'
    ).slice(0, 15);

    const markers = [];
    validWithCoords.forEach((msg) => {
      const isRes = msg.deliveryStatus === 'RESOLVED';
      const color = isRes ? '#16a34a' : '#dc2626';

      const icon = L.divIcon({
        className: 'mini-map-pin',
        html: `<div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [10, 10],
      });

      const m = L.marker([msg.latitude, msg.longitude], { icon }).addTo(map);
      markers.push(m);
    });

    if (validWithCoords.length > 0) {
      const group = new L.featureGroup(markers);
      try {
        map.fitBounds(group.getBounds().pad(0.2));
      } catch {
        // ignore if bounds zero
      }
    }

    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [messages]);

  return (
    <aside className="community-sidebar-right">
      {/* Live Crisis Pulse */}
      <div className="sidebar-widget-card">
        <div className="widget-header">
          <Activity size={16} className="widget-icon" />
          <span>Community Crisis Pulse</span>
        </div>
        <div className="pulse-stats-grid">
          <div className="pulse-stat-item">
            <div className="stat-number stat-danger">{activeCount}</div>
            <div className="stat-label">Active SOS</div>
          </div>
          <div className="pulse-stat-item">
            <div className="stat-number stat-success">{resolvedCount}</div>
            <div className="stat-label">Rescued / Safe</div>
          </div>
          <div className="pulse-stat-item">
            <div className="stat-number stat-info">{uniqueNodes}</div>
            <div className="stat-label">Mesh Nodes</div>
          </div>
        </div>
      </div>

      {/* Mini Geospatial Radar Widget */}
      <div className="sidebar-widget-card">
        <div className="widget-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} className="widget-icon" />
            <span>Crisis Radar Map</span>
          </div>
          <button
            type="button"
            className="btn-link-action"
            onClick={onOpenFullMap}
            title="Expand full map"
          >
            <span>Full Map</span>
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="mini-map-container" ref={miniMapRef} />

        <div className="mini-map-caption">
          <span>● Red: Active Emergency</span>
          <span>● Green: Resolved</span>
        </div>
      </div>

      {/* Mesh & Disaster Guidelines */}
      <div className="sidebar-widget-card guidelines-card">
        <div className="widget-header">
          <ShieldCheck size={16} className="widget-icon" />
          <span>Offline Disaster Protocol</span>
        </div>
        <div className="guidelines-list">
          <div className="guideline-item">
            <BatteryCharging size={15} />
            <div>
              <strong>Conserve Battery:</strong> Dim screen brightness and disable background apps.
            </div>
          </div>
          <div className="guideline-item">
            <WifiOff size={15} />
            <div>
              <strong>Off-Grid LoRa:</strong> Messages hop through neighborhood relays without cellular internet.
            </div>
          </div>
          <div className="guideline-item">
            <Users size={15} />
            <div>
              <strong>Mutual Aid:</strong> Keep clear coordinates so nearby volunteers can locate you safely.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
