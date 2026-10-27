import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, Filter, X } from 'lucide-react';
import { CategoryId } from '../../types/category';
import { ProductSortOption } from '../../types/product';
import categoriesData from '../../data/categories.json';
import { formatINR } from '../../utils/currency';

export const FILE_FORMAT_OPTIONS = [
  { label: 'All Formats', value: 'all' },
  { label: 'PDF Documents (.pdf)', value: '.pdf' },
  { label: 'Figma Kits (.fig)', value: '.fig' },
  { label: 'Prompt Vaults (.json)', value: '.json' },
  { label: 'Spreadsheets (.xlsx)', value: '.xlsx' },
  { label: 'Notion Templates', value: '.notion-template' },
  { label: 'Code Archives (.zip)', value: '.zip' },
  { label: 'Audio Tracks (.mp3 / .wav)', value: '.mp3' },
  { label: 'Terminal Scripts (.sh)', value: '.sh' },
] as const;

export const BUDGET_SHORTCUTS = [
  { label: 'All Prices', value: 200000 },
  { label: 'Under ₹500', value: 50000 },
  { label: 'Under ₹1,000', value: 100000 },
  { label: 'Under ₹1,500', value: 150000 },
] as const;

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryChange: (category: CategoryId | 'all') => void;
  selectedSort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  selectedFormat?: string | 'all';
  onFormatChange?: (format: string | 'all') => void;
  maxPricePaise?: number;
  onMaxPriceChange?: (pricePaise: number) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  selectedFormat = 'all',
  onFormatChange,
  maxPricePaise = 200000,
  onMaxPriceChange,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSort !== 'featured' ||
    selectedFormat !== 'all' ||
    maxPricePaise < 200000;

  const activeCategoryObj = categoriesData.find((c) => c.id === selectedCategory);
  const activeFormatObj = FILE_FORMAT_OPTIONS.find((f) => f.value === selectedFormat);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}
    >
      {/* Top Bar: Search Input & Sort Dropdown */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '480px' }}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description, keywords, format..."
            aria-label="Filter products by text"
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
        </div>

        {/* Sort & Format Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {/* Format Dropdown Filter */}
          {onFormatChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Filter size={14} color="var(--text-muted)" aria-hidden="true" />
              <label htmlFor="format-select" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Format:
              </label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={(e) => onFormatChange(e.target.value)}
                className="input-field select-field"
                aria-label="Filter by file format"
                style={{
                  width: 'auto',
                  padding: 'var(--space-2) 2rem var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {FILE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <SlidersHorizontal size={14} color="var(--text-muted)" aria-hidden="true" />
            <label htmlFor="sort-select" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Sort:
            </label>
            <select
              id="sort-select"
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
              className="input-field select-field"
              style={{
                width: 'auto',
                padding: 'var(--space-2) 2rem var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Releases</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Title: A to Z</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
              aria-label="Reset all search and category filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        role="group"
        aria-label="Filter by category"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          aria-pressed={selectedCategory === 'all'}
          style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
        >
          All Categories ({totalCount})
        </button>

        {categoriesData.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id as CategoryId)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={isSelected}
              style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Controls: Price Budget Slider & Shortcuts */}
      {onMaxPriceChange && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Budget Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 600 }}>
              Budget:
            </span>
            {BUDGET_SHORTCUTS.map((shortcut) => {
              const isActive = maxPricePaise === shortcut.value;
              return (
                <button
                  key={shortcut.value}
                  type="button"
                  onClick={() => onMaxPriceChange(shortcut.value)}
                  style={{
                    background: isActive ? 'var(--accent-lime)' : 'var(--bg-surface-hover)',
                    color: isActive ? 'var(--ink)' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-lime)' : 'var(--border-card)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {shortcut.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: '240px', flex: '1 1 240px', maxWidth: '380px' }}>
            <label
              htmlFor="price-range"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Max: <strong style={{ color: 'var(--accent-lime)' }}>{formatINR(maxPricePaise)}</strong>
            </label>
            <input
              id="price-range"
              type="range"
              min="30000"
              max="200000"
              step="10000"
              value={maxPricePaise}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              aria-label="Filter products by maximum price"
              style={{
                flex: 1,
                accentColor: 'var(--accent-lime)',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {isFiltered && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-1)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Filters:
          </span>

          {/* Search Query Chip */}
          {searchQuery.trim() && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--panel-light)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-card)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>Query: "{searchQuery.trim()}"</span>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Remove search query filter"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Category Chip */}
          {selectedCategory !== 'all' && activeCategoryObj && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(198, 255, 101, 0.12)',
                color: 'var(--accent-lime)',
                border: '1px solid rgba(198, 255, 101, 0.3)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>{activeCategoryObj.name}</span>
              <button
                type="button"
                onClick={() => onCategoryChange('all')}
                aria-label={`Remove category filter ${activeCategoryObj.name}`}
                style={{ background: 'none', border: 'none', color: 'var(--accent-lime)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Format Chip */}
          {selectedFormat !== 'all' && activeFormatObj && onFormatChange && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(199, 189, 255, 0.12)',
                color: 'var(--lavender)',
                border: '1px solid rgba(199, 189, 255, 0.3)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>Format: {activeFormatObj.value}</span>
              <button
                type="button"
                onClick={() => onFormatChange('all')}
                aria-label={`Remove format filter ${activeFormatObj.value}`}
                style={{ background: 'none', border: 'none', color: 'var(--lavender)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Price Chip */}
          {maxPricePaise < 200000 && onMaxPriceChange && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 189, 123, 0.12)',
                color: 'var(--orange)',
                border: '1px solid rgba(255, 189, 123, 0.3)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span>Max: {formatINR(maxPricePaise)}</span>
              <button
                type="button"
                onClick={() => onMaxPriceChange(200000)}
                aria-label="Remove max price filter"
                style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results summary line */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          paddingTop: 'var(--space-2)',
          borderTop: '1px solid var(--border-card)',
        }}
      >
        <span>
          Showing <strong>{filteredCount}</strong> of {totalCount} sample products
        </span>
        <span style={{ color: 'var(--accent-lime)' }}>
          All items DRM-free sample downloads
        </span>
      </div>
    </div>
  );
};
