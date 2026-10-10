import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Cpu, 
  GitCommit, 
  Clock, 
  Info,
  CheckCircle2, 
  Share2, 
  AlertCircle,
  Flame,
  Droplets,
  HeartPulse,
  Activity,
  ShieldAlert,
  HelpCircle,
  Radio
} from 'lucide-react';
import { 
  formatDate, 
  formatRelativeTime, 
  getCategoryBadgeClass, 
  getStatusBadgeClass 
} from '../utils/formatters';

function getCategoryIcon(category) {
  switch (category?.toUpperCase()) {
    case 'FLOOD':
      return <Droplets size={13} />;
    case 'FIRE':
      return <Flame size={13} />;
    case 'MEDICAL':
      return <HeartPulse size={13} />;
    case 'EARTHQUAKE':
      return <Activity size={13} />;
    case 'TRAPPED':
    case 'SEARCH_RESCUE':
      return <AlertCircle size={13} />;
    case 'VIOLENCE':
      return <ShieldAlert size={13} />;
    default:
      return <HelpCircle size={13} />;
  }
}

export default function SosCard({ message, onInspect, onFocusMap, onResolve }) {
  const {
    id,
    emergencyCategory,
    deliveryStatus,
    direction,
    senderDeviceId,
    description,
    assistanceTypes = [],
    latitude,
    longitude,
    locationAccuracyMeters,
    createdAt,
    hopCount = 0,
    maxHopCount = 5,
  } = message;

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';

  return (
    <motion.div
      className="sos-card"
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top Header: Category & Status */}
      <div className="sos-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className={`badge-category ${getCategoryBadgeClass(emergencyCategory)}`}>
            {getCategoryIcon(emergencyCategory)}
            <span>{emergencyCategory || 'UNKNOWN'}</span>
          </span>
          <span className={getStatusBadgeClass(deliveryStatus)}>
            {deliveryStatus || 'PENDING'}
          </span>
        </div>

        {direction && (
          <span className="badge-direction">
            {direction}
          </span>
        )}
      </div>

      {/* ID & Device */}
      <div>
        <div className="sos-meta-id" title={`UUID: ${id}`}>
          <Radio size={12} />
          <span>{id ? `${id.substring(0, 18)}...` : 'No UUID'}</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Cpu size={12} />
          <span>Device: <strong>{senderDeviceId || 'Unknown Node'}</strong></span>
        </div>
      </div>

      {/* Distress Description */}
      <div className={`sos-description ${!description ? 'empty' : ''}`}>
        {description || 'No emergency narrative attached to this signal packet.'}
      </div>

      {/* Assistance tags */}
      {assistanceTypes && assistanceTypes.length > 0 && (
        <div className="assistance-chips">
          {assistanceTypes.map((type, idx) => (
            <span key={idx} className="chip-tag">
              #{type}
            </span>
          ))}
        </div>
      )}

      {/* Telemetry info row */}
      <div className="sos-telemetry-row">
        {hasCoords ? (
          <div className="telemetry-item" title="GPS Location coordinates">
            <MapPin size={12} style={{ color: '#0f172a' }} />
            <span>
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
            {locationAccuracyMeters && (
              <span style={{ color: '#94a3b8' }}>
                (±{Math.round(locationAccuracyMeters)}m)
              </span>
            )}
          </div>
        ) : (
          <div className="telemetry-item" style={{ color: '#94a3b8' }}>
            <MapPin size={12} />
            <span>No GPS lock</span>
          </div>
        )}

        <div className="telemetry-item" title="Mesh relay hop count" style={{ marginLeft: 'auto' }}>
          <GitCommit size={12} />
          <span>Hops: {hopCount}/{maxHopCount}</span>
        </div>
      </div>

      {/* Footer with Timestamp and Action */}
      <div className="sos-card-footer">
        <div className="timestamp-text" title={formatDate(createdAt)}>
          <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
          {formatRelativeTime(createdAt)}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {deliveryStatus !== 'RESOLVED' && onResolve && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onResolve(id, 'RESOLVED')}
              title="Mark as Resolved"
              style={{ color: '#166534', borderColor: '#bbf7d0' }}
            >
              <CheckCircle2 size={12} />
              <span>Resolve</span>
            </button>
          )}

          {hasCoords && onFocusMap && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onFocusMap(message)}
              title="Locate on map"
            >
              <MapPin size={12} />
              <span>Map</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onInspect(message)}
            title="View SOS details"
          >
            <Info size={12} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
