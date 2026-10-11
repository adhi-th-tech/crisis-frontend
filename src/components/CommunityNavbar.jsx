import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  RefreshCw, 
  Map, 
  MessageSquare,
  User,
  LogIn,
  LogOut,
  HeartHandshake
} from 'lucide-react';

export default function CommunityNavbar({
  dbConnected,
  totalCount,
  onRefresh,
  loading,
  activeView,
  setActiveView,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) {
  return (
    <header className="community-header">
      <div className="community-header-inner">
        {/* Brand Identity */}
        <div className="brand-group" onClick={() => setActiveView('feed')} style={{ cursor: 'pointer' }}>
          <motion.div 
            className="brand-logo-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Radio size={20} className="brand-logo-icon" />
            <span className="pulse-ping" />
          </motion.div>
          <div>
            <div className="brand-name">
              CriSoS <span>Community</span>
            </div>
            <div className="brand-tagline">
              Decentralized Emergency SOS & Mutual Aid Feed
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Feed vs Map) */}
        <div className="header-nav-tabs">
          <button
            type="button"
            className={`header-tab-btn ${activeView === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveView('feed')}
          >
            <MessageSquare size={16} />
            <span>Community Feed</span>
          </button>
          <button
            type="button"
            className={`header-tab-btn ${activeView === 'map' ? 'active' : ''}`}
            onClick={() => setActiveView('map')}
          >
            <Map size={16} />
            <span>Crisis Map</span>
          </button>
        </div>

        {/* Right Actions: Auth & Quick Refresh */}
        <div className="header-action-group">
          {currentUser ? (
            <div className="navbar-user-section">
              <div className="navbar-user-pill">
                <div className="navbar-user-avatar">
                  {currentUser.username.substring(0, 1).toUpperCase()}
                </div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">@{currentUser.username}</span>
                  <span className="navbar-volunteer-badge">Volunteer</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-auth-logout"
                onClick={onLogout}
                title="Log Out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-auth-login"
              onClick={onOpenAuthModal}
            >
              <LogIn size={14} />
              <span>Login / Sign Up</span>
            </button>
          )}

          <motion.button
            className="btn-icon-subtle"
            onClick={onRefresh}
            disabled={loading}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            title="Refresh community signals"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 1, ease: 'linear' }}
            >
              <RefreshCw size={16} />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
