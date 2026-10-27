# DigiEcom — Complete Digital E-commerce Storefront

**DigiEcom** is a modern, responsive digital-products storefront built with **React**, **Vite**, and **TypeScript**. It provides a high-contrast dark ink & purple visual identity with vibrant lime, violet, orange, and pink accents, tailored for technical builders, operators, and creators.

> **Release Status: Storefront Preview (Phase 1)**
>
> This release provides the complete public storefront, product taxonomy, live filtering, and metadata discovery layer. **Payment processing and automated digital fulfillment remain intentionally disabled** until server-side cryptographic webhooks and signed cloud storage are configured in Phase 2.

---

## 1. Quick Start & Linux Commands

Target OS: Ubuntu / Zorin OS Linux (x86-64), Node.js v20+ / v22+, npm 10+.

### Clone / Navigate to Project Root
```bash
cd ~/DigiEcom
```

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
The development server will launch at `http://localhost:5173/` with Instant Hot Module Replacement (HMR).

### Run Automated Quality Assurance Tests
```bash
npm test
```
Runs 44 unit and component tests via Vitest and Testing Library.

To run tests in watch mode:
```bash
npm run test:watch
```

### Production Build
```bash
npm run build
```
Executes TypeScript type checking (`tsc`) followed by Vite production bundling into `dist/`.

### Preview Production Build Locally
```bash
npm run preview
```
Serves the generated `dist/` directory at `http://localhost:4173/`.

---

## 2. Architecture & Directory Structure

```
~/DigiEcom/
├── public/
│   ├── favicon.svg          # Brand text/vector icon mark
│   ├── robots.txt           # Crawl policies; disallows private routes; sitemap link
│   ├── sitemap.xml          # Search index with canonical routes and sample product slugs
│   └── _redirects           # SPA routing fallback for Netlify & Cloudflare Pages
├── src/
│   ├── assets/              # Static vector illustrations and brand graphics
│   ├── components/
│   │   ├── common/          # Header, Footer, Breadcrumbs, DemoBanner, SkipLink
│   │   ├── home/            # Hero, CategoryExplorer, Featured, Benefits, HowItWorks, Trust, Newsletter
│   │   ├── layout/          # RootLayout with semantic landmarks
│   │   └── products/        # ProductCard, ProductGrid, ProductFilters, ProductCoverVisual
│   ├── data/
│   │   ├── categories.json  # 6 core digital asset categories
│   │   └── products.json    # 12 typed demonstration catalogue items
│   ├── hooks/
│   │   └── useDocumentTitle.ts # Dynamic SEO document.title and meta descriptions
│   ├── pages/
│   │   ├── HomePage.tsx            # Complete 10-section homepage
│   │   ├── ProductsPage.tsx        # Search, category filtering & sorting
│   │   ├── ProductDetailPage.tsx   # Detailed specs, inclusions, FAQs, disabled checkout
│   │   ├── AboutPage.tsx           # Mission & storefront architecture disclosure
│   │   ├── ContactPage.tsx         # Support hours & structured inquiry form
│   │   ├── NotFoundPage.tsx        # 404 page with recovery navigation
│   │   └── policies/               # 5 editable starter legal policy documents
│   │       ├── PrivacyPolicyPage.tsx
│   │       ├── TermsPage.tsx
│   │       ├── RefundPolicyPage.tsx
│   │       ├── DeliveryPolicyPage.tsx
│   │       └── LicensePolicyPage.tsx
│   ├── services/
│   │   ├── checkout/        # Future checkout boundary & Order types (disabled)
│   │   └── delivery/        # Future digital delivery & signed URL stubs (disabled)
│   ├── styles/
│   │   ├── tokens.css       # Reusable CSS design tokens (colors, radii, spacing)
│   │   └── globals.css      # Base resets, typography, buttons, accessible focus
│   ├── types/               # TypeScript interfaces (Product, Category, Order)
│   ├── utils/
│   │   └── currency.ts      # Safe integer paise currency formatting (INR ₹)
│   ├── App.tsx              # Route table
│   └── main.tsx             # React DOM root entry
├── tests/                   # 9 comprehensive Vitest & RTL test suites (44 tests)
├── .env.example             # Configuration template with non-secret placeholders
├── .gitignore               # Excludes secrets, node_modules, dist, and private downloads
├── tsconfig.json            # Strict TypeScript compiler options
├── vercel.json              # SPA routing rewrite rule for Vercel
└── vite.config.ts           # Bundler and Vitest test runner configuration
```

---

## 3. Brand & Design Tokens

DigiEcom implements a custom, accessible design token system defined in `src/styles/tokens.css` and `src/styles/globals.css`:

- **Background Surfaces:**
  - App background: `--bg-app: #080514`
  - Cards & panels: `--bg-surface: #100c24`, elevated `--bg-surface-elevated: #171133`
- **Vibrant Accents:**
  - Lime: `--accent-lime: #10ef8a` (Primary action CTA & DRM-free indicators)
  - Violet: `--accent-violet: #a855f7` (Secondary accents & category indicators)
  - Orange: `--accent-orange: #f97316` (Financial & commercial tags)
  - Pink: `--accent-pink: #ec4899` (Design kits & creative tools)
  - Cyan: `--accent-cyan: #06b6d4` (Productivity hubs)
- **Safe Currency Standards:**
  - All prices stored as integer paise (`pricePaise: 79900` = ₹799.00) to prevent IEEE-754 floating-point inaccuracies.
- **Accessibility & Reduced Motion:**
  - High-contrast typography exceeding WCAG AA minimums (`--text-primary: #f8fafc`).
  - Full keyboard focus indicators (`:focus-visible`).
  - Native `prefers-reduced-motion` queries disabling transitions for sensitive users.
  - Skip to main content link for screen readers.

---

## 4. Product Catalogue (Demonstration Content)

The catalogue includes 12 realistic sample products across 6 core categories:
1. **E-books & Guides:** Distributed system design handbooks, zero-to-one founder playbooks.
2. **AI Prompts & Resources:** Multi-shot engineering prompt vaults, autonomous agent configurations.
3. **Business Templates:** 5-year dynamic SaaS financial models, startup contract starter packs.
4. **Productivity Tools:** Notion engineering sprint hubs, Obsidian second-brain vaults.
5. **Design & Creative Assets:** Lumina UI Figma design systems, 3D neo-fintech illustration assets.
6. **Other Digital Downloads:** 60-minute deep-work lossless ambient audio, developer terminal dotfiles.

Each product record is explicitly marked as demonstration content with a visible `DEMO` badge.

---

## 5. Checkout & Digital Delivery Architecture

### Current Phase 1 Storefront
- Payment processing is **disabled**.
- No credit card numbers, CVVs, or UPI details are collected.
- No fake payment-success screens or pretend order confirmations are generated.
- Purchase buttons display an honest `Checkout Coming Soon (Disabled)` status with an explanatory warning banner.
- Zero private digital product archives are placed in the `public/` web directory.

### Production Phase 2 Roadmap
To activate live purchasing and automated file delivery:
1. **Trusted Backend:** Deploy a Node.js/Go backend to calculate product prices server-side.
2. **Payment Gateway:** Configure Razorpay or Stripe with webhook signing secret verification.
3. **Idempotent Order Fulfillment:** Ensure orders cannot be fulfilled multiple times.
4. **Signed Storage URLs:** Store digital files in private AWS S3 or Cloudflare R2 buckets. Generate short-lived (e.g., 2-hour) cryptographically signed URLs only after verifying payment state on the server.

---

## 6. Static Hosting & Free-Tier Deployment

DigiEcom is compiled into static HTML, CSS, and JS, making it deployable on any modern static hosting provider.

### Build Command (Host-Independent)
```bash
npm run build
```
- **Output Directory:** `dist`
- **Node Version:** 20+

### Deployment Targets:

#### Option A: Vercel (Hobby Free Tier)
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- The included `vercel.json` automatically routes all non-asset paths to `/index.html` for client-side routing.

#### Option B: Netlify (Free Tier)
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- The included `public/_redirects` file (`/* /index.html 200`) ensures client-side routing works on refresh.

#### Option C: Cloudflare Pages (Free Tier)
- **Build Command:** `npm run build`
- **Build Output Directory:** `dist`
- Uses `public/_redirects` automatically for SPA routing.

#### Option D: GitHub Pages
- Host `dist/` on `gh-pages` branch. Configure custom 404 fallback or hash routing if required.

---

## 7. Quality Assurance & Test Verification

All 44 automated tests pass with 0 failures:
- `tests/CurrencyFormatting.test.ts` (5 tests): Safe paise to INR formatting, zero and edge cases.
- `tests/Homepage.test.tsx` (8 tests): Header, Hero, Category Explorer, Benefits, How It Works, Trust, Newsletter placeholder, no fake cart.
- `tests/Catalogue.test.tsx` (4 tests): Search keyword filtering, category tabs, sorting, empty state, filter reset.
- `tests/ProductDetail.test.tsx` (3 tests): Product metadata, breadcrumbs, price formatting, inclusions, FAQ accordion, related items.
- `tests/InvalidSlug.test.tsx` (2 tests): 404 handling for invalid slugs and unknown routes.
- `tests/CheckoutDisabled.test.tsx` (5 tests): Disabled checkout button, absence of fake success screens, safe rejection of order requests.
- `tests/SecurityAndDelivery.test.tsx` (6 tests): Verifies public asset directory contains no private files, robots.txt crawl rules, non-secret .env.example, .gitignore.
- `tests/LegalPages.test.tsx` (7 tests): Starter templates for About, Contact, Privacy, Terms, Refunds, Delivery, and License.
- `tests/NavigationAndLinks.test.tsx` (4 tests): Skip link, semantic landmarks, valid category IDs, footer policy route mapping.

### Browser Testing Checklist (Manual QA):
- [x] Responsive layout verified from 320px (mobile) to 1440px+ (desktop).
- [x] Mobile hamburger menu opens and closes with keyboard escape and click.
- [x] Visible focus outline displayed on interactive elements.
- [x] Search input navigates to `/products?q=...` seamlessly.
- [x] Category dropdown in desktop header navigates to filtered catalogue view.
- [x] Contact form displays honest confirmation modal without sending fake emails.

---

## 8. License & Commercial Notice

This storefront is developed as an initial preview release. The legal policies provided under `/policies/` contain bracketed placeholders (`[Legal Entity Name]`, `[Applicable Jurisdiction]`, `[Support Email]`) that must be customized and reviewed by legal counsel before commercial operations commence.
