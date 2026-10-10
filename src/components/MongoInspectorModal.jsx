import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Radio, 
  Clock, 
  MapPin, 
  Cpu, 
  GitCommit,
  CheckCircle2,
  Save,
  Info
} from 'lucide-react';
import { 
  formatDate, 
  getCategoryBadgeClass, 
  getStatusBadgeClass 
} from '../utils/formatters';

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

export default function MongoInspectorModal({ sos, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(sos?.deliveryStatus || 'QUEUED');
  const [responderNotes, setResponderNotes] = useState(sos?.responderNotes || '');
  const [updating, setUpdating] = useState(false);

  if (!sos) return null;

  const handleSaveStatus = async (statusToSet) => {
    setUpdating(true);
    try {
      await onUpdateStatus(sos.id, statusToSet || newStatus, responderNotes);
    } finally {
      setUpdating(false);
    }
  };

  const isResolved = (sos.deliveryStatus || '').toUpperCase() === 'RESOLVED';

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
          {/* Modal Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
                <div className="modal-title">
                  SOS Incident Details
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b' }}>
                  ID: {sos.id || 'N/A'}
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

          {/* Modal Body */}
          <div className="modal-body">
            {/* Category & Status Summary Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Emergency:</span>
                <span className={`badge-category ${getCategoryBadgeClass(sos.emergencyCategory)}`}>
                  {sos.emergencyCategory || 'OTHER'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                <span className={getStatusBadgeClass(sos.deliveryStatus)}>
                  {sos.deliveryStatus}
                </span>
              </div>
            </div>

            {/* Emergency Narrative */}
            <div className="form-group">
              <div className="form-label">Distress Narrative</div>
              <div style={{
                padding: '0.85rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.88rem',
                color: '#0f172a',
                lineHeight: 1.5,
              }}>
                {sos.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No distress message attached to this beacon</span>}
              </div>
            </div>

            {/* Assistance Types */}
            {sos.assistanceTypes && sos.assistanceTypes.length > 0 && (
              <div className="form-group">
                <div className="form-label">Required Assistance Vectors</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {sos.assistanceTypes.map((type, idx) => (
                    <span key={idx} className="chip-tag" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      #{type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grid of Key Attributes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              fontSize: '0.8rem',
            }}>
              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>SENDER DEVICE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, marginTop: '2px' }}>
                  {sos.senderDeviceId || 'Unknown'}
                </div>
              </div>

              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TRANSMISSION DIRECTION</div>
                <div style={{ marginTop: '2px', fontWeight: 500 }}>
                  {sos.direction || 'OUTGOING'}
                </div>
              </div>

              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>LOCATION COORDINATES</div>
                <div style={{ marginTop: '2px', fontWeight: 500 }}>
                  {sos.latitude && sos.longitude
                    ? `${sos.latitude.toFixed(6)}, ${sos.longitude.toFixed(6)}`
                    : 'GPS coordinates unavailable'}
                </div>
                {sos.locationAccuracyMeters && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Accuracy radius: ±{sos.locationAccuracyMeters}m
                  </div>
                )}
              </div>

              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>MESH RELAY HOPS</div>
                <div style={{ marginTop: '2px', fontWeight: 500 }}>
                  {sos.hopCount ?? 0} hops (Max: {sos.maxHopCount ?? 5})
                </div>
              </div>

              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>EMITTED AT</div>
                <div style={{ marginTop: '2px' }}>
                  {formatDate(sos.createdAt)}
                </div>
              </div>

              <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>SERVER RECEIVED AT</div>
                <div style={{ marginTop: '2px' }}>
                  {formatDate(sos.serverReceivedAt)}
                </div>
              </div>
            </div>

            {/* Resolution Status Management Section */}
            <div style={{
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                  Update Transmission Status
                </div>
                {!isResolved && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSaveStatus('RESOLVED')}
                    disabled={updating}
                    style={{ background: '#166534', borderColor: '#166534' }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Quick Mark as Resolved</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="QUEUED">QUEUED</option>
                  <option value="SENT">SENT</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="RELAYED">RELAYED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveStatus(newStatus)}
                  disabled={updating}
                >
                  <Save size={14} />
                  <span>{updating ? 'Updating...' : 'Save Status'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
