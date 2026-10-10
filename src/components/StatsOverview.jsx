import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RadioTower, 
  Layers, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function StatsOverview({ stats, rawMessages }) {
  // Compute derived statistics from actual messages array
  const total = stats?.total || rawMessages.length;
  
  const pendingCount = rawMessages.filter(
    (m) => m.deliveryStatus === 'QUEUED' || m.deliveryStatus === 'RECEIVED' || m.deliveryStatus === 'SENT'
  ).length;

  const resolvedCount = rawMessages.filter(
    (m) => m.deliveryStatus === 'RESOLVED' || m.deliveryStatus === 'DELIVERED'
  ).length;

  const uniqueDevices = new Set(rawMessages.map((m) => m.senderDeviceId).filter(Boolean)).size;

  const latestTime = rawMessages.length > 0 
    ? Math.max(...rawMessages.map((m) => m.createdAt || 0)) 
    : null;

  return (
    <motion.div 
      className="kpi-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total SOS */}
      <motion.div className="kpi-card" variants={itemVariants}>
        <div className="kpi-info">
          <div className="kpi-label">Total SOS Messages</div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-subtext">Stored in Mongo Atlas collection</div>
        </div>
        <div className="kpi-icon-container">
          <Layers size={18} />
        </div>
      </motion.div>

      {/* Active Alerts */}
      <motion.div className="kpi-card" variants={itemVariants}>
        <div className="kpi-info">
          <div className="kpi-label">In Transit / Sent</div>
          <div className="kpi-value" style={{ color: '#0369a1' }}>
            {pendingCount}
          </div>
          <div className="kpi-subtext">Active unclosed distress alerts</div>
        </div>
        <div className="kpi-icon-container" style={{ background: '#e0f2fe', color: '#0369a1' }}>
          <AlertTriangle size={18} />
        </div>
      </motion.div>

      {/* Resolved / Delivered */}
      <motion.div className="kpi-card" variants={itemVariants}>
        <div className="kpi-info">
          <div className="kpi-label">Delivered / Handled</div>
          <div className="kpi-value" style={{ color: '#166534' }}>
            {resolvedCount}
          </div>
          <div className="kpi-subtext">Acknowledged by rescue nodes</div>
        </div>
        <div className="kpi-icon-container" style={{ background: '#dcfce7', color: '#166534' }}>
          <CheckCircle2 size={18} />
        </div>
      </motion.div>

      {/* Mesh Relay Devices */}
      <motion.div className="kpi-card" variants={itemVariants}>
        <div className="kpi-info">
          <div className="kpi-label">Transmitter Nodes</div>
          <div className="kpi-value">{uniqueDevices}</div>
          <div className="kpi-subtext">Unique LoRa / BLE mesh radios</div>
        </div>
        <div className="kpi-icon-container">
          <RadioTower size={18} />
        </div>
      </motion.div>

      {/* Latest Distress Beacon */}
      <motion.div className="kpi-card" variants={itemVariants}>
        <div className="kpi-info">
          <div className="kpi-label">Latest Beacon</div>
          <div className="kpi-value" style={{ fontSize: '1.25rem' }}>
            {latestTime ? formatRelativeTime(latestTime) : 'N/A'}
          </div>
          <div className="kpi-subtext">Server epoch sync verified</div>
        </div>
        <div className="kpi-icon-container">
          <Clock size={18} />
        </div>
      </motion.div>
    </motion.div>
  );
}
