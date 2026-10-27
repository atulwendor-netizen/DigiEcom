import React, { useState, useMemo } from 'react';
import { Product, ProductSortOption } from '../../types/product';
import { CategoryId } from '../../types/category';
import { ProductFilters } from '../products/ProductFilters';
import { ProductGrid } from '../products/ProductGrid';
import { RevealOnScroll } from '../common/RevealOnScroll';

interface HomeProductCollectionProps {
  products: Product[];
}

export const HomeProductCollection: React.FC<HomeProductCollectionProps> = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedSort, setSelectedSort] = useState<ProductSortOption>('featured');

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.fileFormats.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (selectedSort) {
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        list.sort((a, b) => a.pricePaise - b.pricePaise);
        break;
      case 'price-desc':
        list.sort((a, b) => b.pricePaise - a.pricePaise);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedSort]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('featured');
  };

  return (
    <section
      id="product-collection"
      aria-labelledby="collection-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
      }}
    >
      <div className="container">
        {/* Header */}
        <RevealOnScroll>
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <span className="badge badge-lime" style={{ marginBottom: 'var(--space-2)' }}>
              Live Catalogue Explorer
            </span>
            <h2
              id="collection-heading"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 'var(--space-2)',
              }}
            >
              Browse All Digital Products
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Filter by discipline, keyword, or price. All prices are stated in INR (integer paise representation).
            </p>
          </div>
        </RevealOnScroll>

        {/* Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
          onReset={handleReset}
        />

        {/* Grid */}
        <ProductGrid
          products={filteredProducts}
          onResetFilters={handleReset}
          emptyTitle="No digital products match your filter criteria"
          emptyDescription="Try selecting another category or resetting your search keywords."
        />
      </div>
    </section>
  );
};
