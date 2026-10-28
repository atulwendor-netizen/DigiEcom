import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset form when modal opens or view changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isAuthModalOpen, authModalView]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authModalView === 'login') {
        const res = await login(email, password || 'password123');
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        }
      } else {
        const res = await signup(fullName, email, password || 'password123', phone);
        if (!res.success) {
          setError(res.error || 'Could not complete registration.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    setError(null);
    const res = await login(demoEmail, 'password123');
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Demo login failed');
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      onClick={closeAuthModal}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <div
        className="auth-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-6)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), 0 0 40px rgba(187, 242, 70, 0.08)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close authentication dialog"
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(187, 242, 70, 0.12)',
              border: '1px solid rgba(187, 242, 70, 0.3)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <Sparkles size={12} color="var(--accent-lime)" />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--accent-lime)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              DigiEcom Account
            </span>
          </div>

          <h2
            id="auth-modal-title"
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 var(--space-1) 0',
            }}
          >
            {authModalView === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
            {authModalView === 'login'
              ? 'Access your digital library, licenses, and verified order history.'
              : 'Join DigiEcom to securely manage instant digital downloads and invoices.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--ink-2)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: authModalView === 'login' ? 'var(--panel-light)' : 'transparent',
              color: authModalView === 'login' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: authModalView === 'signup' ? 'var(--panel-light)' : 'transparent',
              color: authModalView === 'signup' ? 'var(--accent-lime)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--text-xs)',
              color: '#f87171',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts */}
        <div
          style={{
            backgroundColor: 'var(--ink-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
            Instant Demo Logins:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('anant@example.com')}
              style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-lime)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
            >
              <div style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>Anant Sharma</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>2 Owned Products</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya@example.com')}
              style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-lime)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
            >
              <div style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>Priya Patel</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>1 Owned Product</div>
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {authModalView === 'signup' && (
            <div>
              <label
                htmlFor="auth-fullname"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}
              >
                Full Name <span style={{ color: 'var(--accent-pink)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  placeholder="e.g. Anant Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}
            >
              Email Address <span style={{ color: 'var(--accent-pink)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}
            >
              Password <span style={{ color: 'var(--accent-pink)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password (e.g. password123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 36px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {authModalView === 'signup' && (
            <div>
              <label
                htmlFor="auth-phone"
                style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}
              >
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 800,
              marginTop: 'var(--space-2)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{authModalView === 'login' ? 'Sign In to DigiEcom' : 'Create My Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Assurance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-dim)',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-lime)" />
          <span>Local session &bull; Your digital deliverables remain private</span>
        </div>
      </div>
    </div>
  );
};
