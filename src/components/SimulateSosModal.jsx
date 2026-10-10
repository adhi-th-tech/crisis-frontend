import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Radio, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', damping: 25, stiffness: 350 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 15,
    transition: { duration: 0.15 }
  },
};

const ASSISTANCE_OPTIONS = [
  'RESCUE',
  'FIRST_AID',
  'EVACUATION',
  'BOAT_RESCUE',
  'DRINKING_WATER',
  'FOOD_RATIONS',
  'OXYGEN_SUPPORT',
  'SEARCH_TEAM',
];

export default function SimulateSosModal({ isOpen, onClose, onEmitSos }) {
  const [category, setCategory] = useState('FLOOD');
  const [description, setDescription] = useState('');
  const [deviceId, setDeviceId] = useState(`node-${Math.random().toString(36).substring(2, 8)}`);
  const [latitude, setLatitude] = useState(10.232 + (Math.random() - 0.5) * 0.05);
  const [longitude, setLongitude] = useState(76.409 + (Math.random() - 0.5) * 0.05);
  const [accuracy, setAccuracy] = useState(12.5);
  const [selectedAssistance, setSelectedAssistance] = useState(['RESCUE']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleAssistance = (type) => {
    setSelectedAssistance((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleRandomizeCoords = () => {
    setLatitude(parseFloat((10.23 + (Math.random() - 0.5) * 0.08).toFixed(6)));
    setLongitude(parseFloat((76.40 + (Math.random() - 0.5) * 0.08).toFixed(6)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        messageType: 'SOS',
        senderDeviceId: deviceId,
        emergencyCategory: category,
        description: description.trim() || `Automated emergency beacon: ${category} reported`,
        assistanceTypes: selectedAssistance,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationAccuracyMeters: parseFloat(accuracy),
        locationTimestamp: Date.now(),
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        hopCount: 1,
        maxHopCount: 5,
        deliveryStatus: 'QUEUED',
        direction: 'OUTGOING',
        incidentId: `INC-${Math.floor(Math.random() * 9000 + 1000)}`,
      };

      await onEmitSos(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch SOS signal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Radio size={16} />
              </div>
              <div>
                <div className="modal-title">Broadcast SOS Signal</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Simulate emergency packet upload into MongoDB Atlas
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '4px', border: 'none' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-body">
            {errorMsg && (
              <div style={{
                padding: '0.65rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: '6px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Emergency Category */}
            <div className="form-group">
              <label className="form-label">Disaster Emergency Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="FLOOD">FLOOD (Water Inundation)</option>
                <option value="FIRE">FIRE (Blaze / Wildfire / Industrial)</option>
                <option value="MEDICAL">MEDICAL (Critical Trauma / Urgent)</option>
                <option value="EARTHQUAKE">EARTHQUAKE (Structural Collapse)</option>
                <option value="TRAPPED">TRAPPED (Submerged / Debris)</option>
                <option value="VIOLENCE">VIOLENCE (Active Threat)</option>
                <option value="OTHER">OTHER (General Emergency)</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">SOS Distress Message / Situation</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Flash flooding in river basin, family of 4 stranded on roof terrace..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Assistance Needed */}
            <div className="form-group">
              <label className="form-label">Required Assistance Vectors</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ASSISTANCE_OPTIONS.map((item) => {
                  const active = selectedAssistance.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAssistance(item)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        border: '1px solid',
                        borderColor: active ? '#0f172a' : '#cbd5e1',
                        background: active ? '#0f172a' : '#ffffff',
                        color: active ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Device ID and Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Transmitter Node ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Accuracy (Meters)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRandomizeCoords}
                style={{ width: '100%' }}
              >
                <RefreshCw size={12} />
                <span>Randomize Coordinates in Crisis Zone</span>
              </button>
            </div>

            <div className="modal-footer" style={{ margin: '0 -1.5rem -1.5rem -1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Send size={14} />
                <span>{submitting ? 'Transmitting...' : 'Emit SOS Beacon'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
