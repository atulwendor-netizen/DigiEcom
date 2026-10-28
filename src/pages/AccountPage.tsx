import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Download,
  Shield,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface AccountPageProps {
  defaultTab?: 'library' | 'profile' | 'security';
}

export const AccountPage: React.FC<AccountPageProps> = ({ defaultTab = 'library' }) => {
  const { user, isAuthenticated, orders, updateProfile, logout, openAuthModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab') as 'library' | 'profile' | 'security' | null;
  const [activeTab, setActiveTab] = useState<'library' | 'profile' | 'security'>(
    tabParam || defaultTab
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile edit state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'India',
  });

  useDocumentTitle('My Account & Digital Library — DigiEcom');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        country: user.country || 'India',
      });
    }
  }, [user]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'library' | 'profile' | 'security') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopy = (licenseKey: string) => {
    navigator.clipboard?.writeText(licenseKey);
    setCopiedKey(licenseKey);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      fullName: formData.fullName,
      phone: formData.phone,
      country: formData.country,
    });
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // If user is not authenticated, render friendly sign-in prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(187, 242, 70, 0.12)',
              border: '1px solid rgba(187, 242, 70, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={32} color="var(--accent-lime)" />
          </div>

          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>
            Sign In to Access Your Library
          </h1>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Please sign in to your DigiEcom account to view your purchased digital products, commercial license keys,
            and permanent download links.
          </p>

          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', gap: '8px', fontWeight: 800 }}
          >
            <User size={18} />
            <span>Sign In to DigiEcom</span>
          </button>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-lime)',
                cursor: 'pointer',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate user totals
  const totalItemsOwned = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
  const totalSpentPaise = orders.reduce((sum, order) => sum + order.amountPaise, 0);

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16) var(--space-4)' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-lime)',
              color: '#000',
              fontWeight: 900,
              fontSize: 'var(--text-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(187, 242, 70, 0.25)',
            }}
          >
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {user.fullName}
              </h1>
              <span
                className="badge badge-success"
                style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
              >
                Verified Buyer
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              {user.email} &bull; Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Products Owned</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
              {totalItemsOwned}
            </div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Spent</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {formatINR(totalSpentPaise)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--border-card)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('library')}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            border: 'none',
            borderBottom: activeTab === 'library' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'library' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color var(--transition-fast)',
          }}
        >
          <Download size={16} />
          <span>My Digital Library ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'profile' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color var(--transition-fast)',
          }}
        >
          <User size={16} />
          <span>Profile & Details</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('security')}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            border: 'none',
            borderBottom: activeTab === 'security' ? '2px solid var(--accent-lime)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'security' ? 'var(--accent-lime)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color var(--transition-fast)',
          }}
        >
          <Shield size={16} />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* Tab 1: Digital Library */}
      {activeTab === 'library' && (
        <div>
          {orders.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: 'var(--space-12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-4)',
              }}
            >
              <ShoppingBag size={48} color="var(--text-muted)" />
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                No digital products in your library yet
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '400px', margin: 0 }}>
                Browse our curated collection of verified developer guides, system design handbooks, and design kits.
              </p>
              <Link to="/products" className="btn btn-primary" style={{ gap: '8px' }}>
                <span>Explore Product Catalogue</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                  }}
                >
                  {/* Order Top Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-2)',
                      paddingBottom: 'var(--space-3)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-lime)',
                          fontWeight: 700,
                        }}
                      >
                        {order.id}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        &bull; Purchased {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                        {formatINR(order.amountPaise)}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                      >
                        <Printer size={12} />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Purchased Items & Deliverables */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {order.deliverables && order.deliverables.length > 0 ? (
                      order.deliverables.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: 'var(--panel)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                          }}
                        >
                          <div>
                            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                              {item.productName}
                            </h3>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                              Formats: {item.fileFormat} &bull; Size: {item.fileSize}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {/* License Key Box */}
                            <div
                              style={{
                                backgroundColor: 'var(--ink-2)',
                                border: '1px solid var(--border-card)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {item.licenseKey}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.licenseKey)}
                                aria-label="Copy license key"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: copiedKey === item.licenseKey ? 'var(--accent-lime)' : 'var(--text-dim)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {copiedKey === item.licenseKey ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>

                            {/* Download Button */}
                            <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              style={{ gap: '6px', fontSize: 'var(--text-xs)' }}
                            >
                              <Download size={14} />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Items: {order.items.map((i) => i.productName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Details */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px' }}>
          {saveSuccess && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'rgba(187, 242, 70, 0.12)',
                border: '1px solid rgba(187, 242, 70, 0.35)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: 'var(--space-4)',
                color: 'var(--accent-lime)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Personal Information
            </h2>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--ink-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-dim)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'not-allowed',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Email is tied to your verified licenses and cannot be changed directly.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Country / Region
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 'fit-content', padding: '10px 24px', fontWeight: 800, marginTop: 'var(--space-2)' }}
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Security & Sessions */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0 }}>
              Account Security
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              Your session is cryptographically stored in your browser. All orders and licenses are tied to your primary email address.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--panel)',
                borderRadius: 'var(--radius-md)',
                marginTop: 'var(--space-2)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>Current Session</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-lime)' }}>Active &bull; Verified Browser</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: '#f87171' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
