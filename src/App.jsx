import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Radio
} from 'lucide-react';

import CommunityNavbar from './components/CommunityNavbar';
import CommunityFeed from './components/CommunityFeed';
import SosMapView from './components/SosMapView';
import SimulateSosModal from './components/SimulateSosModal';
import AuthPage from './components/AuthPage';

// Backend API URL (defaults directly to deployed Render backend)
const RAW_API_BASE = import.meta.env.VITE_API_BASE || 'https://crisos-backend.onrender.com/api';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

export default function App() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('crisos_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Social Community Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'urgent' | 'needs' | 'nearby' | 'resolved'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'urgent' | 'hops'
  const [activeView, setActiveView] = useState('feed'); // 'feed' | 'map' | 'auth'

  // Modals & Focus State
  const [focusedSos, setFocusedSos] = useState(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Verify auth session from cookie/token on mount
  useEffect(() => {
    const token = localStorage.getItem('crisos_token');
    fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('crisos_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  }, []);

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('crisos_user', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('crisos_token', token);
    }
    showToast(`Welcome, @${user.username}!`);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    localStorage.removeItem('crisos_user');
    localStorage.removeItem('crisos_token');
    setCurrentUser(null);
    showToast('Signed out of volunteer session.');
  };

  // Fetch messages and stats from MongoDB Atlas
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/sos?limit=250`);
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
      setError(`Backend connection error (${API_BASE}): ${err.message}. If Render is waking from sleep, please allow ~30s and click Retry.`);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived counts for sidebar channels
  const counts = useMemo(() => {
    const total = messages.length;
    const urgent = messages.filter(
      (m) => m.deliveryStatus !== 'RESOLVED' && m.deliveryStatus !== 'DELIVERED'
    ).length;
    const needs = messages.filter(
      (m) => Array.isArray(m.assistanceTypes) && m.assistanceTypes.length > 0
    ).length;
    const located = messages.filter(
      (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number'
    ).length;
    const resolved = messages.filter(
      (m) => m.deliveryStatus === 'RESOLVED' || m.deliveryStatus === 'DELIVERED'
    ).length;

    return { total, urgent, needs, located, resolved };
  }, [messages]);

  // Extract all unique tags and their frequency
  const availableTags = useMemo(() => {
    const tagMap = {};
    messages.forEach((m) => {
      if (Array.isArray(m.assistanceTypes)) {
        m.assistanceTypes.forEach((t) => {
          if (!t) return;
          const clean = t.toUpperCase().trim();
          tagMap[clean] = (tagMap[clean] || 0) + 1;
        });
      }
    });

    return Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [messages]);

  // Filter and sort messages for the community stream
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

    // Channel filter
    if (activeFilter === 'urgent') {
      result = result.filter(
        (m) => m.deliveryStatus !== 'RESOLVED' && m.deliveryStatus !== 'DELIVERED'
      );
    } else if (activeFilter === 'needs') {
      result = result.filter(
        (m) => Array.isArray(m.assistanceTypes) && m.assistanceTypes.length > 0
      );
    } else if (activeFilter === 'nearby') {
      result = result.filter(
        (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number'
      );
    } else if (activeFilter === 'resolved') {
      result = result.filter(
        (m) => m.deliveryStatus === 'RESOLVED' || m.deliveryStatus === 'DELIVERED'
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (m) => m.emergencyCategory?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter(
        (m) =>
          Array.isArray(m.assistanceTypes) &&
          m.assistanceTypes.some((t) => t.toUpperCase().trim() === selectedTag.toUpperCase().trim())
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortBy === 'urgent') {
        const isAActive = a.deliveryStatus !== 'RESOLVED';
        const isBActive = b.deliveryStatus !== 'RESOLVED';
        if (isAActive && !isBActive) return -1;
        if (!isAActive && isBActive) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortBy === 'hops') {
        return (a.hopCount || 0) - (b.hopCount || 0);
      }
      return 0;
    });

    return result;
  }, [messages, searchQuery, activeFilter, selectedCategory, selectedTag, sortBy]);

  // Update SOS status in MongoDB Atlas
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

      showToast(`Status updated to ${newStatus} for SOS alert!`);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, deliveryStatus: newStatus, responderNotes } : m))
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Volunteer handler
  const handleVolunteer = async (id) => {
    if (!currentUser) {
      setActiveView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Please sign in or create an account to volunteer.');
      return;
    }

    try {
      const token = localStorage.getItem('crisos_token');
      const res = await fetch(`${API_BASE}/sos/${id}/volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ username: currentUser.username }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update volunteer status');
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data.data } : m))
      );

      showToast(
        data.volunteered
          ? `You volunteered to respond to SOS ${id.slice(0, 8)}!`
          : `Volunteer response withdrawn for SOS ${id.slice(0, 8)}.`
      );
    } catch (err) {
      alert(`Error volunteering: ${err.message}`);
    }
  };

  // Broadcast new SOS signal into MongoDB
  const handleEmitSos = async (payload) => {
    const res = await fetch(`${API_BASE}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to broadcast SOS');
    }

    showToast('Emergency SOS posted to the community feed!');
    await fetchData();
  };

  const handleFocusMap = (sos) => {
    setFocusedSos(sos);
    setActiveView('map');
  };

  return (
    <div className="community-app-container">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="community-toast"
          >
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Social Navigation Bar */}
      <CommunityNavbar
        dbConnected={dbConnected}
        totalCount={messages.length}
        onRefresh={fetchData}
        loading={loading}
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setActiveView('auth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleLogout}
      />

      {/* Dedicated Auth Page OR Feed / Map Layout */}
      {activeView === 'auth' ? (
        <AuthPage
          onAuthSuccess={(user, token) => {
            handleAuthSuccess(user, token);
            setActiveView('feed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBack={() => {
            setActiveView('feed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          apiBase={API_BASE}
        />
      ) : (
        <main className="community-main-layout">
          {/* Connection Issue Banner */}
          {error && (
            <div className="community-error-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="btn-retry"
                onClick={fetchData}
              >
                Retry Connection
              </button>
            </div>
          )}

          <div className="community-single-container">
            {activeView === 'feed' ? (
              <CommunityFeed
                messages={filteredMessages}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onPostSos={handleEmitSos}
                onResolve={handleUpdateStatus}
                onFocusMap={handleFocusMap}
                onShowToast={showToast}
                totalRawCount={messages.length}
                counts={counts}
                availableTags={availableTags}
                currentUser={currentUser}
                onVolunteer={handleVolunteer}
                onOpenAuthModal={() => {
                  setActiveView('auth');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="full-map-wrapper">
                <div className="map-view-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} style={{ color: '#dc2626' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Geospatial Emergency Radar Map
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-back-to-feed"
                    onClick={() => setActiveView('feed')}
                  >
                    <MessageSquare size={14} />
                    <span>Back to Community Feed</span>
                  </button>
                </div>
                <SosMapView
                  messages={filteredMessages}
                  onInspect={(sos) => handleFocusMap(sos)}
                  focusedSos={focusedSos}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Dispatch SOS Modal (Fallback Trigger) */}
      <SimulateSosModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onEmitSos={handleEmitSos}
      />
    </div>
  );
}
