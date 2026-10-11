import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  Radio,
  HeartHandshake,
  CheckCircle2,
  Users,
  MapPin
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess, onBack, apiBase }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Username is required');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? `${apiBase}/auth/signup` : `${apiBase}/auth/login`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Stores JWT in HTTP-only cookie
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Top Bar with Back Button */}
      <div className="auth-page-topbar">
        <button
          type="button"
          className="btn-back-feed"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Back to Community Feed</span>
        </button>
      </div>

      <div className="auth-page-center">
        {/* Brand Banner */}
        <div className="auth-brand-block">
          <div className="auth-brand-icon">
            <Radio size={24} />
            <span className="pulse-ping" />
          </div>
          <h1 className="auth-brand-title">
            CriSoS <span>Community Portal</span>
          </h1>
          <p className="auth-brand-desc">
            Decentralized Emergency SOS & Citizen Volunteer Network
          </p>
        </div>

        {/* Main Auth Card */}
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Tab Switcher */}
          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-item ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-item ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
          </div>

          <div className="auth-card-body">
            <div className="auth-card-subheading">
              {mode === 'login' 
                ? 'Sign in to respond to live SOS alerts and volunteer in your area.'
                : 'Register as an emergency volunteer to respond to distress calls.'}
            </div>

            {/* Error banner */}
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form-body">
              <div className="auth-field">
                <label className="auth-field-label">Username</label>
                <div className="auth-input-box">
                  <User size={16} className="auth-field-icon" />
                  <input
                    type="text"
                    className="auth-text-input"
                    placeholder="e.g. responder_alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-box">
                  <Lock size={16} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <span className="auth-security-hint">
                    🔒 Password is encrypted with a secure bcrypt hash before storage.
                  </span>
                )}
              </div>

              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-field-label">Confirm Password</label>
                  <div className="auth-input-box">
                    <Lock size={16} className="auth-field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-auth-action"
                disabled={loading}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to CriSoS</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Register Volunteer Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-prompt">
              {mode === 'login' ? (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Footer */}
        <div className="auth-perks-grid">
          <div className="auth-perk-card">
            <HeartHandshake size={18} style={{ color: '#2563eb' }} />
            <div className="auth-perk-text">
              <strong>Mobilize Response:</strong> Click "I Volunteer" on any SOS to notify rescuers and coordinate aid.
            </div>
          </div>
          <div className="auth-perk-card">
            <Radio size={18} style={{ color: '#dc2626' }} />
            <div className="auth-perk-text">
              <strong>Mesh Telemetry:</strong> Receive distress signals relayed off-grid via LoRa radio beacons.
            </div>
          </div>
          <div className="auth-perk-card">
            <ShieldCheck size={18} style={{ color: '#16a34a' }} />
            <div className="auth-perk-text">
              <strong>Encrypted & Safe:</strong> JWT session tokens and one-way password hashing protect your privacy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
