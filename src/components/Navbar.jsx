import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Database, RefreshCw, PlusCircle, Server, Activity } from 'lucide-react';

export default function Navbar({
  dbConnected,
  totalCount,
  onRefresh,
  loading,
  onOpenSimulate,
  activeView,
  setActiveView
}) {
  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand Section */}
        <div className="brand-section">
          <motion.div 
            className="brand-icon-wrapper"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Radio size={20} strokeWidth={2.2} />
          </motion.div>
          <div>
            <div className="brand-title">
              CriSoS
              <span className="brand-tag">MongoDB Atlas</span>
            </div>
            <div className="brand-subtitle">
              Disaster Emergency Mesh SOS Telemetry
            </div>
          </div>
        </div>

        {/* Database & Actions */}
        <div className="header-actions">
          {/* Connection Status Indicator */}
          {/* <div className="db-pill">
            <span className={`db-dot ${dbConnected ? '' : 'offline'}`} />
            <span>
              {dbConnected ? (
                <>Atlas: <strong>crisos.sos_messages</strong> ({totalCount} docs)</>
              ) : (
                'Database Offline'
              )}
            </span>
          </div> */}

          {/* Quick Trigger / New Alert */}
          {/* <motion.button
            className="btn btn-secondary"
            onClick={onOpenSimulate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Dispatch a test SOS alert into MongoDB Atlas"
          >
            <PlusCircle size={15} />
            <span>Emit SOS</span>
          </motion.button> */}

          {/* Refresh Button */}
          <motion.button
            className="btn btn-primary"
            onClick={onRefresh}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Re-fetch live data from MongoDB Atlas"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 1, ease: 'linear' }}
            >
              <RefreshCw size={14} />
            </motion.div>
            <span>{loading ? 'Fetching...' : 'Refresh'}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
