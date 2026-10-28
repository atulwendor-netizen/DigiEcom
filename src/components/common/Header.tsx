import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Layers, ShoppingBag } from 'lucide-react';
import categoriesData from '../../data/categories.json';
import { DemoBanner } from './DemoBanner';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../../context/CartContext';
import { UserMenu } from '../auth/UserMenu';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { openCart, itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
  };

  return (
    <>
      <DemoBanner />
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '4.5rem',
              gap: 'var(--space-4)',
            }}
          >
            {/* Logo */}
            <Link
              to="/"
              onClick={closeMenus}
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              aria-label="DigiEcom Home"
            >
              <BrandLogo size="md" showTagline={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="desktop-nav"
              aria-label="Main Navigation"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 'var(--space-6)',
              }}
            >
              <Link
                to="/"
                style={{
                  color: location.pathname === '/' ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                Home
              </Link>
              <Link
                to="/products"
                style={{
                  color: location.pathname === '/products' ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                All Products
              </Link>

              {/* Categories Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onBlur={(e) => {
                    // Close if click outside
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setCategoryDropdownOpen(false);
                    }
                  }}
                  aria-expanded={categoryDropdownOpen}
                  aria-haspopup="true"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: categoryDropdownOpen ? 'var(--accent-lime)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: 'var(--space-2) 0',
                  }}
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: categoryDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)',
                    }}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '-20px',
                      width: '280px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-2)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                    }}
                  >
                    {categoriesData.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        onClick={() => setCategoryDropdownOpen(false)}
                        role="menuitem"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--text-sm)',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Layers size={16} color="var(--accent-lime)" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{cat.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {cat.popularFormats.join(', ')}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/about"
                style={{
                  color: location.pathname === '/about' ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                About
              </Link>

              <Link
                to="/contact"
                style={{
                  color: location.pathname === '/contact' ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                Contact
              </Link>
            </nav>

            {/* Header Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="header-search-form"
              style={{
                display: 'none',
                position: 'relative',
                width: '220px',
              }}
              role="search"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search digital products"
                className="input-field"
                style={{
                  paddingLeft: '2.25rem',
                  paddingTop: '0.45rem',
                  paddingBottom: '0.45rem',
                  fontSize: 'var(--text-xs)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              />
            </form>

            {/* Right Side: Primary Browse CTA, User Menu, Cart Trigger & Mobile Menu Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Link to="/products" className="btn btn-primary btn-sm desktop-cta">
                Browse Products
              </Link>

              {/* User Account / Sign In Trigger */}
              <div className="desktop-user-menu" style={{ display: 'none' }}>
                <UserMenu />
              </div>

              {/* Shopping Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="cart-trigger-btn cart-btn"
                aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
                style={{
                  position: 'relative',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: 'var(--space-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--panel-light)';
                  e.currentTarget.style.borderColor = 'rgba(198, 255, 101, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                }}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span
                    className="cart-count-badge cart-badge"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'var(--accent-lime)',
                      color: 'var(--ink)',
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '999px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(198, 255, 101, 0.4)',
                      lineHeight: 1,
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: 'var(--space-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-drawer mobile-drawer-animated"
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: 'var(--space-6) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} role="search" style={{ position: 'relative' }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, guides, prompts..."
                aria-label="Search digital products mobile"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </form>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link
                to="/"
                onClick={closeMenus}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                }}
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={closeMenus}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                }}
              >
                All Products
              </Link>

              {/* Mobile Categories Accordion */}
              <div style={{ padding: 'var(--space-2) var(--space-3)' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    color: 'var(--accent-lime)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  Categories
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                  {categoriesData.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={closeMenus}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{cat.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {cat.popularFormats[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/about"
                onClick={closeMenus}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                }}
              >
                About DigiEcom
              </Link>

              <Link
                to="/contact"
                onClick={closeMenus}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                }}
              >
                Contact & Support
              </Link>

              <Link
                to="/account"
                onClick={closeMenus}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-lime)',
                  fontWeight: 700,
                  fontSize: 'var(--text-base)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Digital Library & Purchases</span>
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => {
                closeMenus();
                openCart();
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'var(--space-2)',
              }}
            >
              <ShoppingBag size={18} />
              <span>View Shopping Cart ({itemCount})</span>
            </button>

            <Link
              to="/products"
              onClick={closeMenus}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              Explore Full Catalogue
            </Link>
          </div>
        )}
      </header>
    </>
  );
};
