import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Database, LogOut, ExternalLink, ShieldCheck, RefreshCw, Package, HardDrive } from 'lucide-react';
import { AdminStorageService } from '../../services/admin/adminStorage.service';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    provider: string;
    details?: string;
  }>({
    status: 'checking...',
    provider: 'local',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    const health = await AdminStorageService.getHealth();
    setHealthStatus({
      status: health.status || 'unknown',
      provider: health.provider || 'local',
      details: health.details,
    });
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSignOut = () => {
    AdminStorageService.clearStoredAdminKey();
    navigate('/admin/login');
  };

  const isOperational = healthStatus.status === 'operational';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Administration Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-card)',
          backgroundColor: 'var(--panel)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand / Admin identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            to="/admin/storage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-lime-subtle)',
                border: '1px solid var(--accent-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={17} color="var(--accent-lime)" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-md)', letterSpacing: '-0.02em' }}>
                DigiEcom
              </span>
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--panel-light)',
                  color: 'var(--accent-lime)',
                  border: '1px solid var(--border-card)',
                }}
              >
                Admin Console
              </span>
            </div>
          </Link>

          {/* Provider / Health Status Pill */}
          <div
            title={healthStatus.details || 'Storage Service Status'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: isOperational ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${isOperational ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isOperational ? '#22c55e' : '#eab308',
                display: 'inline-block',
              }}
            />
            <span style={{ color: isOperational ? '#86efac' : '#fde047', fontWeight: 600 }}>
              {healthStatus.provider}: {healthStatus.status}
            </span>
            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              aria-label="Refresh health status"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-card)',
              backgroundColor: 'var(--panel-light)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ExternalLink size={13} />
            <span>View Storefront</span>
          </Link>

          <button
            onClick={handleSignOut}
            aria-label="Sign out of admin console"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: '#f87171',
              background: 'none',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Section Navigation Tabs */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-card)',
          backgroundColor: 'rgba(18, 14, 28, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '0 24px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Link
          to="/admin/products"
          style={{
            padding: '12px 16px',
            textDecoration: 'none',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: location.pathname.startsWith('/admin/products') ? 'var(--accent-lime)' : 'var(--text-secondary)',
            borderBottom: location.pathname.startsWith('/admin/products') ? '2px solid var(--accent-lime)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <Package size={15} />
          <span>Product Catalogue</span>
        </Link>

        <Link
          to="/admin/storage"
          style={{
            padding: '12px 16px',
            textDecoration: 'none',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: location.pathname.startsWith('/admin/storage') || location.pathname === '/admin' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            borderBottom: location.pathname.startsWith('/admin/storage') || location.pathname === '/admin' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <HardDrive size={15} />
          <span>Digital Storage Vault</span>
        </Link>
      </nav>

      {/* Main Admin Workspace Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-card)',
          padding: '16px 24px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--accent-lime)" />
          <span>Authenticated Session • Protected Administrative Console</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
          DigiEcom Platform v1.0 • Free-First Storage Architecture
        </div>
      </footer>
    </div>
  );
};
