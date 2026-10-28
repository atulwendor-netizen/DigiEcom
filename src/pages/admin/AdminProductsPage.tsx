import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileCheck,
  FileX,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  ManagedProduct,
  ProductService,
  ProductStatus,
} from '../../services/product.service';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const res = await ProductService.getAdminProducts(statusFilter, categoryFilter || undefined, searchQuery || undefined);
    setProducts(res.products);
    setTotalCount(res.total);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleStatusToggle = async (productId: string, newStatus: ProductStatus) => {
    const res = await ProductService.toggleProductStatus(productId, newStatus);
    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
    } else {
      alert(res.error || 'Failed to update product status');
    }
  };

  const handleDeleteProduct = async (product: ManagedProduct) => {
    if (window.confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`)) {
      setIsLoading(true);
      const res = await ProductService.deleteProduct(product.id);
      setIsLoading(false);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setTotalCount((c) => Math.max(0, c - 1));
      } else {
        alert(res.error || 'Failed to delete product.');
      }
    }
  };

  const handleSaveSuccess = (saved: ManagedProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    fetchProducts();
  };

  // Metrics
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const unpublishedCount = products.filter((p) => p.status === 'unpublished').length;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Product Catalogue Manager
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create, configure, publish, and attach secure digital deliverables to DigiEcom storefront products.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
            style={{
              padding: '9px 16px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Total Catalogue Items
          </span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {totalCount || products.length}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Published (Storefront Live)
          </span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent-lime)', marginTop: '6px' }}>
            {publishedCount}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Drafts & Review
          </span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#fde047', marginTop: '6px' }}>
            {draftCount}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Unpublished / Archived
          </span>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-dim)', marginTop: '6px' }}>
            {unpublishedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        className="card"
        style={{
          padding: '16px',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'published', 'draft', 'unpublished'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: statusFilter === st ? 'var(--accent-lime)' : 'var(--border-card)',
                backgroundColor: statusFilter === st ? 'rgba(166, 255, 61, 0.1)' : 'var(--panel-light)',
                color: statusFilter === st ? 'var(--accent-lime)' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '520px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--panel-light)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: 'var(--text-xs)',
            }}
          >
            <option value="">All Categories</option>
            <option value="ebooks-guides">E-books & Guides</option>
            <option value="templates">Templates & Kits</option>
            <option value="presets">Audio & Presets</option>
            <option value="code-snippets">Code & Components</option>
          </select>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, tag, or slug..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 30px',
                  backgroundColor: 'var(--panel-light)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: 'var(--text-xs)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: 'var(--text-xs)' }}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={fetchProducts}
              title="Refresh list"
              className="btn btn-secondary"
              style={{ padding: '8px', fontSize: 'var(--text-xs)' }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </form>
        </div>
      </div>

      {/* Product Table */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {products.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Package size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
              No Products Found
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: 'var(--text-xs)', maxWidth: '400px', marginInline: 'auto' }}>
              No catalogue items match your search or status filter criteria.
            </p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
            >
              + Create Product Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '10px' }}>
                  <th style={{ padding: '12px 14px' }}>Product</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>Price</th>
                  <th style={{ padding: '12px 14px' }}>Deliverable File</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Title & Preview Cover */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            background: product.coverGradient || 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <Package size={16} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                            ID: {product.id} • /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--panel-light)',
                          border: '1px solid var(--border-card)',
                          fontSize: '11px',
                          color: '#ffffff',
                        }}
                      >
                        {product.categoryLabel || product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>
                      ₹{(product.pricePaise / 100).toFixed(2)}
                    </td>

                    {/* Deliverable File Indicator */}
                    <td style={{ padding: '12px 14px' }}>
                      {product.attachedFileId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-lime)' }}>
                          <FileCheck size={14} />
                          <span style={{ fontSize: '11px' }}>
                            {product.attachedFileName || 'Binary Attached'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308' }}>
                          <FileX size={14} />
                          <span style={{ fontSize: '11px' }}>No Vault Asset</span>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle Dropdown */}
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusToggle(product.id, e.target.value as ProductStatus)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor:
                            product.status === 'published'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : product.status === 'draft'
                              ? 'rgba(234, 179, 8, 0.1)'
                              : 'rgba(113, 113, 122, 0.1)',
                          border: `1px solid ${
                            product.status === 'published'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : product.status === 'draft'
                              ? 'rgba(234, 179, 8, 0.3)'
                              : 'rgba(113, 113, 122, 0.3)'
                          }`,
                          color:
                            product.status === 'published'
                              ? '#86efac'
                              : product.status === 'draft'
                              ? '#fde047'
                              : '#d4d4d8',
                        }}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="unpublished">Unpublished</option>
                      </select>
                    </td>

                    {/* Row Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on storefront"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'var(--panel-light)',
                            border: '1px solid var(--border-card)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={13} />
                        </a>

                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsFormOpen(true);
                          }}
                          title="Edit product"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'var(--panel-light)',
                            border: '1px solid var(--border-card)',
                            borderRadius: 'var(--radius-md)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit2 size={13} color="var(--accent-lime)" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete product"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: '#f87171',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialProduct={editingProduct}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};
