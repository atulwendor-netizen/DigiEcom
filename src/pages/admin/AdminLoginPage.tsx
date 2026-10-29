import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Database } from 'lucide-react';
import { AdminStorageService } from '../../services/admin/adminStorage.service';

interface AdminLoginPageProps {
  onSuccess?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState(() => {
    return AdminStorageService.getStoredAdminKey() || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (AdminStorageService.isAuthenticated()) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/products', { replace: true });
      }
    }
  }, [navigate, onSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setErrorMessage('Please enter your Admin Storage API Key');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await AdminStorageService.verifyAdminKey(adminKey.trim());
    setIsLoading(false);

    if (result.success && result.valid) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/products');
      }
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your admin key.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-4)',
        position: 'relative',
      }}
    >
      {/* Return to storefront link */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={16} />
          <span>Return to Storefront</span>
        </Link>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-lime-subtle)',
              border: '1px solid var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3) auto',
            }}
          >
            <Database size={24} color="var(--accent-lime)" />
          </div>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              color: '#ffffff',
            }}
          >
            DigiEcom Storage Admin
          </h1>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              marginTop: '6px',
              lineHeight: 1.5,
            }}
          >
            Secure administrative console for digital asset storage, metadata inspection, and operational health.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: 'var(--space-4)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="admin-api-key"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Admin Storage API Key
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  display: 'flex',
                }}
              >
                <Key size={16} />
              </div>
              <input
                id="admin-api-key"
                type={showKey ? 'text' : 'password'}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_STORAGE_API_KEY..."
                autoComplete="off"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 36px',
                  backgroundColor: 'var(--panel-light)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Hide admin key' : 'Show admin key'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {adminKey && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--accent-lime)',
                }}
              >
                <span>✓ Remembered key loaded on this device</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !adminKey.trim()}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              justifyContent: 'center',
              gap: '8px',
              opacity: isLoading || !adminKey.trim() ? 0.7 : 1,
              cursor: isLoading || !adminKey.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <Lock size={15} />
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Open Dashboard'}</span>
          </button>
        </form>

        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-card)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <span style={{ color: 'var(--accent-lime)' }}>●</span>
            <strong>Timing-Safe Evaluation:</strong>
          </div>
          Key is verified server-side with HMAC-SHA256 constant-time comparison. It is stored exclusively in your browser session and never committed or exposed publicly.
        </div>
      </div>
    </div>
  );
};
