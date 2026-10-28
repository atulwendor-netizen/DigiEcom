import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Download, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal, orders } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal('login')}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          fontSize: 'var(--text-xs)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        <User size={14} color="var(--accent-lime)" />
        <span>Sign In</span>
      </button>
    );
  }

  // Get user initials (e.g. "Anant Sharma" -> "AS")
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar Button Trigger */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label={`User menu for ${user.fullName}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px 4px 4px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-lime)';
          e.currentTarget.style.backgroundColor = 'var(--panel-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-card)';
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
        }}
      >
        {/* Initials Badge */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-lime)',
            color: '#000',
            fontWeight: 800,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initials}
        </div>

        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.fullName.split(' ')[0]}
        </span>

        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            transform: dropdownOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-fast)',
          }}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(187, 242, 70, 0.05)',
            padding: 'var(--space-2)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
          role="menu"
        >
          {/* User Details Header */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--ink-2)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                {user.fullName}
              </span>
              <Sparkles size={12} color="var(--accent-lime)" />
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-dim)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>

          {/* Menu Items */}
          <Link
            to="/account"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--panel-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color="var(--accent-lime)" />
              <span>My Profile & Settings</span>
            </div>
          </Link>

          <Link
            to="/account?tab=library"
            onClick={() => setDropdownOpen(false)}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--panel-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} color="var(--accent-lime)" />
              <span>Digital Library</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: 'rgba(187, 242, 70, 0.15)',
                color: 'var(--accent-lime)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {orders.length}
            </span>
          </Link>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              color: '#f87171',
              background: 'transparent',
              border: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
