import React from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CategoryId } from '../../types/category';
import { ProductSortOption } from '../../types/product';
import categoriesData from '../../data/categories.json';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryChange: (category: CategoryId | 'all') => void;
  selectedSort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
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
  totalCount,
  filteredCount,
  onReset,
}) => {
  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedSort !== 'featured';

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

        {/* Sort & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
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
