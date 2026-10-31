import React, { useState, useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import { CategoryMarquee } from '../components/home/CategoryMarquee';
import { CategoryExplorer } from '../components/home/CategoryExplorer';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { BenefitsSection } from '../components/home/BenefitsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { HomeProductCollection } from '../components/home/HomeProductCollection';
import { TrustSection } from '../components/home/TrustSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Product } from '../types/product';
import { ProductService } from '../services/product.service';

export const HomePage: React.FC = () => {
  useDocumentTitle(
    'Digital Storefront for Builders & Creators',
    'Explore professional system design books, AI prompts, SaaS business models, and developer assets. Preview storefront release.'
  );

  const [products, setProducts] = useState<Product[]>(() => {
    return ProductService.getInitialPublishedProducts() as unknown as Product[];
  });

  const loadProducts = () => {
    ProductService.getPublishedProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res as unknown as Product[]);
      }
    });
  };

  useEffect(() => {
    loadProducts();

    const handleProductsChange = () => {
      loadProducts();
    };

    window.addEventListener('digiecom_products_changed', handleProductsChange);
    window.addEventListener('storage', handleProductsChange);

    return () => {
      window.removeEventListener('digiecom_products_changed', handleProductsChange);
      window.removeEventListener('storage', handleProductsChange);
    };
  }, []);

  return (
    <>
      <Hero />
      <CategoryMarquee />
      <CategoryExplorer />
      <FeaturedProducts products={products} />
      <BenefitsSection />
      <HowItWorksSection />
      <HomeProductCollection products={products} />
      <TrustSection />
      <NewsletterSection />
    </>
  );
};
