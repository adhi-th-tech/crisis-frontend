import React from 'react';
import { 
  Radio, 
  AlertCircle, 
  HeartHandshake, 
  MapPin, 
  CheckCircle2, 
  PhoneCall, 
  Hash, 
  Globe, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Activity 
} from 'lucide-react';

export default function CommunitySidebarLeft({
  activeFilter,
  setActiveFilter,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  counts,
  availableTags = [],
}) {
  return (
    <aside className="community-sidebar-left">
      {/* Profile / Responder Identity */}
      <div className="sidebar-profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <Radio size={20} />
          </div>
          <span className="profile-status-dot" title="Mesh Node Connected" />
        </div>
        <div className="profile-info">
          <div className="profile-name">
            Citizen Responder
            <span className="badge-verified">✓</span>
          </div>
          <div className="profile-role">
            Active Mesh Relay Node
          </div>
        </div>
      </div>

      {/* Main Feed Navigation */}
      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">CHANNELS & SIGNALS</div>
        <nav className="sidebar-nav-menu">
          <button
            type="button"
            className={`sidebar-nav-item ${activeFilter === 'all' && !selectedCategory && !selectedTag ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('all');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
          >
            <Globe size={16} />
            <span className="nav-label">All Community Feeds</span>
            <span className="nav-count">{counts.total}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeFilter === 'urgent' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('urgent');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
          >
            <AlertCircle size={16} style={{ color: '#dc2626' }} />
            <span className="nav-label">Urgent Distress</span>
            <span className="nav-count urgent">{counts.urgent}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeFilter === 'needs' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('needs');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
          >
            <HeartHandshake size={16} style={{ color: '#2563eb' }} />
            <span className="nav-label">Mutual Aid Requests</span>
            <span className="nav-count">{counts.needs}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeFilter === 'nearby' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('nearby');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
          >
            <MapPin size={16} style={{ color: '#059669' }} />
            <span className="nav-label">GPS Located Alerts</span>
            <span className="nav-count">{counts.located}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeFilter === 'resolved' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('resolved');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
            <span className="nav-label">Resolved / Handled</span>
            <span className="nav-count">{counts.resolved}</span>
          </button>
        </nav>
      </div>

      {/* Emergency Topics / Hashtags */}
      <div className="sidebar-nav-section">
        <div className="sidebar-section-title">COMMUNITY TOPICS & NEEDS</div>
        <div className="sidebar-tags-cloud">
          {availableTags.length > 0 ? (
            availableTags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                className={`tag-pill-btn ${selectedTag === tag.name ? 'active' : ''}`}
                onClick={() => {
                  if (selectedTag === tag.name) {
                    setSelectedTag(null);
                  } else {
                    setSelectedTag(tag.name);
                    setActiveFilter('all');
                  }
                }}
              >
                <Hash size={12} />
                <span>{tag.name}</span>
                <span className="tag-pill-count">{tag.count}</span>
              </button>
            ))
          ) : (
            ['RESCUE', 'MEDICAL', 'SHELTER', 'FOOD_WATER', 'EVACUATION'].map((t) => (
              <button
                key={t}
                type="button"
                className={`tag-pill-btn ${selectedTag === t ? 'active' : ''}`}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              >
                <Hash size={12} />
                <span>{t}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Emergency Helpline Directory */}
      <div className="sidebar-helpline-card">
        <div className="helpline-header">
          <PhoneCall size={15} />
          <span>Emergency Hotlines</span>
        </div>
        <div className="helpline-list">
          <div className="helpline-row">
            <span className="help-label">National Emergency:</span>
            <a href="tel:112" className="help-number">112</a>
          </div>
          <div className="helpline-row">
            <span className="help-label">Disaster Relief:</span>
            <a href="tel:1077" className="help-number">1077</a>
          </div>
          <div className="helpline-row">
            <span className="help-label">Medical Ambulance:</span>
            <a href="tel:102" className="help-number">102</a>
          </div>
          <div className="helpline-row">
            <span className="help-label">Fire & Rescue:</span>
            <a href="tel:101" className="help-number">101</a>
          </div>
        </div>
        <div className="helpline-footer">
          Toll-free 24/7 disaster response dispatch
        </div>
      </div>
    </aside>
  );
}
