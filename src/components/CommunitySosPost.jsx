import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Radio, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Activity, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/formatters';

function getCategoryTheme(category) {
  switch (category?.toUpperCase()) {
    case 'FLOOD':
      return {
        icon: Droplets,
        label: 'Flood Alert',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
      };
    case 'FIRE':
      return {
        icon: Flame,
        label: 'Fire Emergency',
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
      };
    case 'MEDICAL':
      return {
        icon: HeartPulse,
        label: 'Medical Emergency',
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
      };
    case 'TRAPPED':
    case 'SEARCH_RESCUE':
      return {
        icon: AlertTriangle,
        label: 'Trapped / Rescue',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
      };
    case 'EARTHQUAKE':
      return {
        icon: Activity,
        label: 'Earthquake Impact',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
      };
    default:
      return {
        icon: HelpCircle,
        label: category || 'General Alert',
        color: '#475569',
        bg: '#f8fafc',
        border: '#e2e8f0',
      };
  }
}

export default function CommunitySosPost({
  message,
  onResolve,
  onFocusMap,
  onTagClick,
  onShowToast,
}) {
  const {
    id,
    emergencyCategory,
    deliveryStatus = 'SENT',
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
    responderNotes,
  } = message;

  const [copied, setCopied] = useState(false);

  const theme = getCategoryTheme(emergencyCategory);
  const CategoryIcon = theme.icon;
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const isResolved = deliveryStatus === 'RESOLVED';

  // Handle sharing
  const handleShare = () => {
    const shareText = `🚨 CriSoS Alert [${emergencyCategory}]: ${
      description || 'Urgent assistance needed'
    } | Node: ${senderDeviceId} | Lat/Lng: ${latitude}, ${longitude}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      if (onShowToast) onShowToast('SOS alert copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generate an avatar initial or character
  const avatarChar = senderDeviceId ? senderDeviceId.substring(0, 2).toUpperCase() : 'SO';

  return (
    <motion.article 
      className={`community-post-card ${isResolved ? 'is-resolved' : ''}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Post Top Header */}
      <div className="post-header">
        <div className="post-author-group">
          {/* Avatar */}
          <div 
            className="post-avatar"
            style={{ 
              borderColor: theme.color,
              background: theme.bg,
              color: theme.color,
            }}
          >
            <span>{avatarChar}</span>
          </div>

          {/* Author info */}
          <div className="post-author-meta">
            <div className="post-author-line">
              <span className="post-author-name">
                {senderDeviceId?.toLowerCase().includes('web') ? 'Citizen Portal' : 'Mesh Transmitter'}
              </span>
              <span className="post-author-handle">
                @{senderDeviceId || 'anonymous-node'}
              </span>
              <span className="post-dot-sep">•</span>
              <span className="post-time" title={formatDate(createdAt)}>
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            <div className="post-telemetry-badge">
              <Radio size={11} />
              <span>Mesh Relay: {hopCount}/{maxHopCount} hops</span>
              {hasCoords && (
                <>
                  <span className="post-dot-sep">•</span>
                  <span>GPS Locked</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badges: Category & Urgency */}
        <div className="post-badge-container">
          <span 
            className="post-category-pill"
            style={{
              color: theme.color,
              backgroundColor: theme.bg,
              borderColor: theme.border,
            }}
          >
            <CategoryIcon size={13} />
            <span>{theme.label}</span>
          </span>

          <span className={`post-status-pill ${deliveryStatus}`}>
            {isResolved ? (
              <>
                <CheckCircle2 size={12} />
                <span>Resolved</span>
              </>
            ) : deliveryStatus === 'IN_PROGRESS' ? (
              <>
                <HeartHandshake size={12} />
                <span>Assisting</span>
              </>
            ) : (
              <>
                <span className="live-ping-dot" />
                <span>Active SOS</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Post Body: Distress Description */}
      <div className="post-body">
        <p className="post-text">
          {description?.trim() ? (
            description
          ) : (
            <span className="post-text-fallback">
              Emergency beacon packet transmitted. Mutual aid and distress response requested for this coordinate sector.
            </span>
          )}
        </p>

        {/* Assistance Hashtags */}
        {assistanceTypes && assistanceTypes.length > 0 && (
          <div className="post-tags-container">
            {assistanceTypes.map((type, idx) => (
              <button
                key={idx}
                type="button"
                className="post-tag-btn"
                onClick={() => onTagClick && onTagClick(type)}
                title={`Filter by #${type}`}
              >
                #{type}
              </button>
            ))}
          </div>
        )}

        {/* Location Card / Preview */}
        {hasCoords && (
          <div className="post-location-card">
            <div className="loc-card-left">
              <div className="loc-card-pin">
                <MapPin size={16} />
              </div>
              <div className="loc-card-text">
                <div className="loc-card-coords">
                  {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
                </div>
                <div className="loc-card-accuracy">
                  Accuracy radius: ±{Math.round(locationAccuracyMeters || 12)} meters
                </div>
              </div>
            </div>

            {onFocusMap && (
              <button
                type="button"
                className="btn-loc-map"
                onClick={() => onFocusMap(message)}
              >
                <span>Locate on Map</span>
                <ExternalLink size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Social Actions Bar */}
      <div className="post-actions-bar">
        {/* Share Button */}
        <button
          type="button"
          className="post-action-btn"
          onClick={handleShare}
          title="Share emergency broadcast"
        >
          <Share2 size={15} />
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Resolve SOS Button */}
        <div style={{ marginLeft: 'auto' }}>
          {!isResolved ? (
            <button
              type="button"
              className="btn-resolve-sos"
              onClick={() => onResolve(id, 'RESOLVED')}
              title="Mark distress call as handled / safe"
            >
              <CheckCircle2 size={14} />
              <span>Mark Resolved</span>
            </button>
          ) : (
            <span className="tag-resolved-pill">
              <CheckCircle2 size={13} />
              <span>Rescue Complete</span>
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
