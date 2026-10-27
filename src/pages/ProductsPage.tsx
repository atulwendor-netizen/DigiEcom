import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductGrid } from '../components/products/ProductGrid';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Product, ProductSortOption } from '../types/product';
import { CategoryId } from '../types/category';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as CategoryId | null;
  const qParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    categoryParam && categoriesData.some((c) => c.id === categoryParam) ? categoryParam : 'all'
  );
  const [selectedSort, setSelectedSort] = useState<ProductSortOption>('featured');

  // Sync state if URL changes
  useEffect(() => {
    if (categoryParam && categoriesData.some((c) => c.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    } else if (!categoryParam) {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  useEffect(() => {
    if (qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
  }, [qParam]);

  const activeCategoryObject = categoriesData.find((c) => c.id === selectedCategory);

  const pageTitle = activeCategoryObject
    ? `${activeCategoryObject.name} — Digital Assets`
    : searchQuery
    ? `Search "${searchQuery}" — Digital Products`
    : 'All Digital Products & Assets';

  useDocumentTitle(
    pageTitle,
    'Browse our complete catalogue of DRM-free e-books, AI prompts, business templates, Notion hubs, and design assets.'
  );

  const products = productsData as unknown as Product[];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

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

  const handleCategoryChange = (category: CategoryId | 'all') => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (!query.trim()) {
      newParams.delete('q');
    } else {
      newParams.set('q', query);
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('featured');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Products', path: '/products' },
            ...(activeCategoryObject ? [{ label: activeCategoryObject.name }] : []),
          ]}
        />

        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3)',
            }}
          >
            {activeCategoryObject ? activeCategoryObject.name : 'Digital Products Catalogue'}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: '680px' }}>
            {activeCategoryObject
              ? activeCategoryObject.description
              : 'Browse our complete collection of DRM-free books, AI prompt repositories, Excel models, Notion workspaces, and Figma kits.'}
          </p>
        </div>

        {/* Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
          onReset={handleReset}
        />

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          onResetFilters={handleReset}
          emptyTitle="No products match your search or filter"
          emptyDescription="Try selecting a different category or clearing your search keywords to view available items."
        />
      </div>
    </div>
  );
};
