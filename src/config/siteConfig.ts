/**
 * DigiEcom Site & Brand Configuration
 *
 * Update these values to personalize your storefront name, headlines,
 * contact email, and legal placeholders in one centralized location.
 */

export interface SiteConfig {
  brandName: string;
  brandTagline: string;
  badgeText: string;
  heroHeadline: string;
  heroHighlightWord: string;
  heroSubheadline: string;
  supportEmail: string;
  supportHours: string;
  supportTimezone: string;
  defaultCurrency: 'INR';
  currencySymbol: string;
  legalEntityNamePlaceholder: string;
  jurisdictionPlaceholder: string;
  copyrightHolder: string;
}

export const siteConfig: SiteConfig = {
  brandName: 'DigiEcom',
  brandTagline: 'Curated Creator & Developer Assets',
  badgeText: 'Storefront Preview • Curated Creator & Developer Assets',
  heroHeadline: 'Your Next Big Idea Starts With the',
  heroHighlightWord: 'Right Digital Tools.',
  heroSubheadline:
    'Discover rigorously structured system design handbooks, benchmarked AI prompt vaults, financial spreadsheets, Figma component libraries, and ergonomic developer dotfiles. Crafted to accelerate modern builders, engineers, and digital operators.',
  supportEmail: 'digiecomsupport1@gmail.com',
  supportHours: 'Monday – Friday, 10:00 AM – 6:00 PM',
  supportTimezone: 'IST (UTC+5:30)',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  legalEntityNamePlaceholder: '[Legal Business Entity Name]',
  jurisdictionPlaceholder: '[City/State, Jurisdiction, Country]',
  copyrightHolder: 'DigiEcom Storefront',
};
