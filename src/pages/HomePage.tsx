import React from 'react';
import { Hero } from '../components/home/Hero';
import { CategoryExplorer } from '../components/home/CategoryExplorer';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { BenefitsSection } from '../components/home/BenefitsSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { HomeProductCollection } from '../components/home/HomeProductCollection';
import { TrustSection } from '../components/home/TrustSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import productsData from '../data/products.json';
import { Product } from '../types/product';

export const HomePage: React.FC = () => {
  useDocumentTitle(
    'Digital Storefront for Builders & Creators',
    'Explore professional system design books, AI prompts, SaaS business models, and developer assets. Preview storefront release.'
  );

  const products = productsData as unknown as Product[];

  return (
    <>
      <Hero />
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
