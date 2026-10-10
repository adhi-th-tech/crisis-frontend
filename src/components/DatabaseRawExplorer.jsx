import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  Database, 
  Info,
  Server,
  Layers,
  Terminal
} from 'lucide-react';
import { formatDate, getCategoryBadgeClass, getStatusBadgeClass } from '../utils/formatters';

export default function DatabaseRawExplorer({ messages, onUpdateStatus }) {
  const [selectedId, setSelectedId] = useState(messages[0]?.id || messages[0]?._id);
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredDocs = messages.filter((doc) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      doc.id?.toLowerCase().includes(q) ||
      doc.emergencyCategory?.toLowerCase().includes(q) ||
      doc.senderDeviceId?.toLowerCase().includes(q) ||
      doc.description?.toLowerCase().includes(q)
    );
  });

  const activeDoc = messages.find((d) => (d.id || d._id) === selectedId) || filteredDocs[0];

  const handleCopy = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(JSON.stringify(activeDoc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inspector-layout">
      {/* Sidebar: Document List */}
      <div className="inspector-sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Database size={15} />
            <span>crisos.sos_messages ({messages.length})</span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Quick filter documents..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px 4px 24px',
                fontSize: '11px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
              }}
            />
            <Search size={12} style={{ position: 'absolute', left: '7px', top: '7px', color: '#94a3b8' }} />
          </div>
        </div>

        <div className="doc-list">
          {filteredDocs.map((doc) => {
            const isSelected = (doc.id || doc._id) === (activeDoc?.id || activeDoc?._id);
            return (
              <div
                key={doc._id || doc.id}
                className={`doc-list-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedId(doc.id || doc._id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge-category ${getCategoryBadgeClass(doc.emergencyCategory)}`} style={{ fontSize: '10px', padding: '1px 5px' }}>
                    {doc.emergencyCategory || 'OTHER'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {doc.deliveryStatus}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.id}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Device: {doc.senderDeviceId || 'Unknown'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel: Document JSON Viewer and Schema Inspector */}
      <div className="doc-json-viewer">
        {activeDoc ? (
          <>
            <div className="viewer-header">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  MongoDB BSON / JSON Document
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  UUID: {activeDoc.id} • Collection: crisos.sos_messages
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy BSON'}</span>
                </button>
              </div>
            </div>

            {/* Document stats overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem',
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Emergency:</span>{' '}
                <strong>{activeDoc.emergencyCategory}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Hops:</span>{' '}
                <strong>{activeDoc.hopCount ?? 0} / {activeDoc.maxHopCount ?? 5}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Direction:</span>{' '}
                <strong>{activeDoc.direction || 'OUTGOING'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Coordinates:</span>{' '}
                <strong>
                  {activeDoc.latitude ? `${activeDoc.latitude.toFixed(3)}, ${activeDoc.longitude.toFixed(3)}` : 'None'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Created:</span>{' '}
                <strong>{formatDate(activeDoc.createdAt)}</strong>
              </div>
            </div>

            {/* Syntax highlighted raw code box */}
            <pre className="json-code-box">
              <code>{JSON.stringify(activeDoc, null, 2)}</code>
            </pre>
          </>
        ) : (
          <div className="empty-state">
            <Info size={24} />
            <div>No documents selected or matched.</div>
          </div>
        )}
      </div>
    </div>
  );
}
