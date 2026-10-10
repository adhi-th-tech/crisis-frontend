import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, MapPin, Radio, GitCommit } from 'lucide-react';
import { 
  formatDate, 
  formatRelativeTime, 
  getCategoryBadgeClass, 
  getStatusBadgeClass 
} from '../utils/formatters';

export default function SosTable({ messages, onInspect, onFocusMap, onResolve }) {
  if (messages.length === 0) {
    return (
      <div className="table-container" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        No matching SOS records found. Try adjusting your search query or category filters.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="sos-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Status</th>
            <th>ID / Device</th>
            <th>Description & Needs</th>
            <th>Location (Lat, Lng)</th>
            <th>Hops</th>
            <th>Received / Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {messages.map((item) => {
              const hasCoords = typeof item.latitude === 'number' && typeof item.longitude === 'number';
              return (
                <motion.tr
                  key={item._id || item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Category */}
                  <td>
                    <span className={`badge-category ${getCategoryBadgeClass(item.emergencyCategory)}`}>
                      {item.emergencyCategory || 'OTHER'}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={getStatusBadgeClass(item.deliveryStatus)}>
                      {item.deliveryStatus || 'PENDING'}
                    </span>
                  </td>

                  {/* ID / Device */}
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500 }}>
                      {item.id ? `${item.id.slice(0, 14)}...` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {item.senderDeviceId || 'Unknown'}
                    </div>
                  </td>

                  {/* Description */}
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No narrative</span>}
                    </div>
                    {item.assistanceTypes && item.assistanceTypes.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                        {item.assistanceTypes.map((t, i) => (
                          <span key={i} className="chip-tag" style={{ fontSize: '0.64rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td>
                    {hasCoords ? (
                      <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} style={{ color: '#0f172a' }} />
                        <span>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No GPS</span>
                    )}
                  </td>

                  {/* Hops */}
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <GitCommit size={12} />
                      {item.hopCount ?? 0}/{item.maxHopCount ?? 5}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td>
                    <div style={{ fontSize: '0.78rem' }}>{formatRelativeTime(item.createdAt)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(item.createdAt)}</div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                      {item.deliveryStatus !== 'RESOLVED' && onResolve && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onResolve(item.id, 'RESOLVED')}
                          title="Mark as Resolved"
                          style={{ color: '#166534', borderColor: '#bbf7d0', padding: '0.2rem 0.45rem' }}
                        >
                          <CheckCircle2 size={11} />
                          <span>Resolve</span>
                        </button>
                      )}
                      {hasCoords && onFocusMap && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onFocusMap(item)}
                          title="View on Map"
                        >
                          <MapPin size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onInspect(item)}
                        title="View SOS details"
                      >
                        <Info size={12} />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
