import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Info, 
  Radio, 
  RefreshCw,
  Layers,
  Inbox
} from 'lucide-react';

import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import FilterControls from './components/FilterControls';
import SosCard from './components/SosCard';
import SosTable from './components/SosTable';
import SosMapView from './components/SosMapView';
import MongoInspectorModal from './components/MongoInspectorModal';
import SimulateSosModal from './components/SimulateSosModal';

// Backend API URL (handles both proxy and direct port 3000 fallback)
const API_BASE = '/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'map' | 'inspector'

  // Modals & Selected Item State
  const [inspectingSos, setInspectingSos] = useState(null);
  const [focusedSos, setFocusedSos] = useState(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch messages and stats from MongoDB Atlas
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch messages list
      const res = await fetch(`${API_BASE}/sos?limit=200`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
        setDbConnected(true);
      } else {
        throw new Error(data.error || 'Failed to retrieve SOS documents');
      }

      // Fetch stats overview
      const statsRes = await fetch(`${API_BASE}/sos/stats`).catch(() => null);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Database connection issue: ${err.message}. Make sure CriSoS backend is running on port 3000.`);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Distinct categories and statuses for filter dropdowns
  const categories = useMemo(() => {
    const set = new Set();
    messages.forEach((m) => {
      if (m.emergencyCategory) set.add(m.emergencyCategory);
    });
    return Array.from(set).sort();
  }, [messages]);

  const statuses = useMemo(() => {
    const set = new Set();
    messages.forEach((m) => {
      if (m.deliveryStatus) set.add(m.deliveryStatus);
    });
    return Array.from(set).sort();
  }, [messages]);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const matchId = m.id?.toLowerCase().includes(q);
        const matchDevice = m.senderDeviceId?.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        const matchCat = m.emergencyCategory?.toLowerCase().includes(q);
        const matchAssistance = Array.isArray(m.assistanceTypes) &&
          m.assistanceTypes.some((a) => a.toLowerCase().includes(q));
        return matchId || matchDevice || matchDesc || matchCat || matchAssistance;
      });
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (m) => m.emergencyCategory?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (m) => m.deliveryStatus?.toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      if (sortBy === 'hops') {
        return (a.hopCount || 0) - (b.hopCount || 0);
      }
      if (sortBy === 'accuracy') {
        const accA = a.locationAccuracyMeters ?? 9999;
        const accB = b.locationAccuracyMeters ?? 9999;
        return accA - accB;
      }
      return 0;
    });

    return result;
  }, [messages, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Update SOS status in MongoDB
  const handleUpdateStatus = async (id, newStatus, responderNotes) => {
    try {
      const res = await fetch(`${API_BASE}/sos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, responderNotes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      showToast(`Status for SOS ${id.slice(0, 8)} updated to ${newStatus}`);
      fetchData();
      if (inspectingSos && inspectingSos.id === id) {
        setInspectingSos(data.data);
      }
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Emit new SOS signal into MongoDB
  const handleEmitSos = async (payload) => {
    const res = await fetch(`${API_BASE}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save SOS to MongoDB');
    }

    showToast('New SOS alert saved directly into MongoDB Atlas!');
    await fetchData();
  };

  const handleFocusMap = (sos) => {
    setFocusedSos(sos);
    setViewMode('map');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="app-container">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <Navbar
        dbConnected={dbConnected}
        totalCount={messages.length}
        onRefresh={fetchData}
        loading={loading}
        onOpenSimulate={() => setIsSimulateOpen(true)}
        activeView={viewMode}
        setActiveView={setViewMode}
      />

      <main className="main-wrapper">
        {/* Error Notification */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchData}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Stats KPI Overview */}
        <StatsOverview stats={stats} rawMessages={messages} />

        {/* Filters and Controls */}
        <FilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          statuses={statuses}
          filteredCount={filteredMessages.length}
          totalCount={messages.length}
          onResetFilters={handleResetFilters}
        />

        {/* Content View Switching */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {filteredMessages.length === 0 ? (
                <div className="empty-state">
                  <Inbox className="empty-icon" />
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>No SOS alerts found</div>
                  <div style={{ fontSize: '0.8rem', maxWidth: '340px' }}>
                    No alerts matched your current search filters. Try clearing the filter options.
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleResetFilters}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="sos-grid">
                  {filteredMessages.map((msg) => (
                    <SosCard
                      key={msg._id || msg.id}
                      message={msg}
                      onInspect={(item) => setInspectingSos(item)}
                      onFocusMap={handleFocusMap}
                      onResolve={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SosTable
                messages={filteredMessages}
                onInspect={(item) => setInspectingSos(item)}
                onFocusMap={handleFocusMap}
                onResolve={handleUpdateStatus}
              />
            </motion.div>
          )}

          {viewMode === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SosMapView
                messages={filteredMessages}
                onInspect={(item) => setInspectingSos(item)}
                focusedSos={focusedSos}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Inspect Document Modal */}
      {inspectingSos && (
        <MongoInspectorModal
          sos={inspectingSos}
          onClose={() => setInspectingSos(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Simulate / Dispatch SOS Modal */}
      <SimulateSosModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onEmitSos={handleEmitSos}
      />
    </div>
  );
}
