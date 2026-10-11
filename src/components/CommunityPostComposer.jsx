import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Send, 
  Radio, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  HelpCircle,
  Crosshair,
  CheckCircle2,
  X
} from 'lucide-react';

const CATEGORIES = [
  { id: 'FLOOD', label: 'Flood Emergency', icon: Droplets, color: '#2563eb' },
  { id: 'FIRE', label: 'Fire / Hazard', icon: Flame, color: '#dc2626' },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: '#e11d48' },
  { id: 'TRAPPED', label: 'Trapped / Rescue', icon: AlertTriangle, color: '#7c3aed' },
  { id: 'EARTHQUAKE', label: 'Earthquake / Collapse', icon: Activity, color: '#d97706' },
  { id: 'OTHER', label: 'General Assistance', icon: HelpCircle, color: '#475569' },
];

const COMMON_ASSISTANCE_TAGS = [
  'RESCUE',
  'MEDICAL',
  'SHELTER',
  'FOOD_WATER',
  'CLOTHING',
  'EVACUATION',
];

export default function CommunityPostComposer({ onPostSos }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FLOOD');
  const [selectedTags, setSelectedTags] = useState(['RESCUE']);
  const [latitude, setLatitude] = useState(10.2319);
  const [longitude, setLongitude] = useState(76.4089);
  const [accuracy, setAccuracy] = useState(15);
  const [deviceNode, setDeviceNode] = useState('CITIZEN-WEB-01');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setAccuracy(Math.round(pos.coords.accuracy || 10));
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to default
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && selectedTags.length === 0) {
      alert('Please provide a brief description or select required assistance tags.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        senderDeviceId: deviceNode.trim() || `WEB-NODE-${Math.random().toString(16).substring(2, 6)}`,
        emergencyCategory: category,
        description: description.trim(),
        assistanceTypes: selectedTags,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationAccuracyMeters: Number(accuracy),
        direction: 'OUTGOING',
        deliveryStatus: 'SENT',
        hopCount: 0,
        maxHopCount: 5,
        messageType: 'SOS',
      };

      await onPostSos(payload);
      setDescription('');
      setSelectedTags(['RESCUE']);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setIsExpanded(false);
      }, 2000);
    } catch (err) {
      alert(`Error broadcasting SOS: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="composer-card">
      <div className="composer-header" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="composer-avatar">
          <Radio size={18} />
        </div>
        {!isExpanded ? (
          <div className="composer-prompt">
            <span className="composer-prompt-desktop">Broadcast an Emergency SOS or Request Help to the Community...</span>
            <span className="composer-prompt-mobile">Broadcast Emergency SOS...</span>
            <button
              type="button"
              className="composer-trigger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              Post SOS
            </button>
          </div>
        ) : (
          <div className="composer-active-title">
            <span>New Emergency Community Broadcast</span>
            <button
              type="button"
              className="composer-close-btn"
              onClick={() => setIsExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="composer-form"
          >
            {/* Category selection chips */}
            <div className="composer-section">
              <label className="composer-label">Emergency Category:</label>
              <div className="category-pill-grid">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-select-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        borderColor: isSelected ? cat.color : undefined,
                        color: isSelected ? cat.color : undefined,
                      }}
                    >
                      <Icon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description textarea */}
            <div className="composer-section">
              <textarea
                className="composer-textarea"
                rows={3}
                placeholder="What is happening? Describe immediate danger, number of people trapped, or urgent aid required..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Assistance needed tags */}
            <div className="composer-section">
              <label className="composer-label">Assistance Needed (Hashtags):</label>
              <div className="tags-pill-row">
                {COMMON_ASSISTANCE_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip-btn ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location row */}
            <div className="composer-location-row">
              <div className="loc-input-group">
                <MapPin size={15} className="loc-icon" />
                <input
                  type="number"
                  step="any"
                  className="loc-input"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  title="Latitude"
                />
                <input
                  type="number"
                  step="any"
                  className="loc-input"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  title="Longitude"
                />
              </div>

              <button
                type="button"
                className="btn-gps-detect"
                onClick={handleGetLocation}
                disabled={locating}
              >
                <Crosshair size={14} className={locating ? 'spin-icon' : ''} />
                <span>{locating ? 'Detecting...' : 'Use My GPS'}</span>
              </button>
            </div>

            {/* Success message preview */}
            {successNotice && (
              <div className="composer-success-banner">
                <CheckCircle2 size={16} />
                <span>SOS Alert broadcasted successfully to the community!</span>
              </div>
            )}

            {/* Footer actions */}
            <div className="composer-footer">
              <span className="composer-hint">
                📡 Broadcasting via CriSoS Mesh & MongoDB Atlas
              </span>

              <div className="composer-footer-buttons">
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-broadcast-submit"
                  disabled={submitting}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Broadcasting...' : 'Broadcast SOS Now'}</span>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
