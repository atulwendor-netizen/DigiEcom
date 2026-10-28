// server/support/groundingContext.ts
import fs from "fs";
import path from "path";

// src/data/products.json
var products_default = [
  {
    id: "de-prod-001",
    slug: "system-design-handbook-cloud-scale",
    name: "The Pragmatic System Design Handbook: Cloud-Scale Microservices",
    category: "ebooks-guides",
    categoryLabel: "E-books & Guides",
    shortDescription: "A 340-page practitioner guide covering distributed consensus, event-driven architectures, caching topologies, and real-world latency budgets.",
    fullDescription: "Building resilient distributed systems requires moving past textbook theory into pragmatic engineering trade-offs. The Pragmatic System Design Handbook walks through end-to-end cloud architectures for modern distributed platforms. Learn how to size message brokers under spiky workloads, establish idempotency keys across microservice boundaries, prevent thundering herds with probabilistic cache invalidation, and design resilient multi-region fallbacks with minimal overhead.",
    pricePaise: 79900,
    currency: "INR",
    coverVisualType: "playbook",
    coverGradient: "linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)",
    gallery: ["Architecture Diagram Overview", "Cache Topology Matrix", "Case Studies Sample"],
    fileFormats: [".pdf", ".epub"],
    compatibility: "Compatible with Apple Books, Kindle, Adobe Acrobat, and any modern EPUB/PDF reader.",
    contents: [
      "340-page DRM-free digital handbook (.pdf & .epub)",
      "High-resolution architectural blueprint posters (Vector SVG & Print PDF)",
      "System design interview evaluation rubric & cheat-sheet (12 pages)",
      "Production outage post-mortem checklists & runbooks"
    ],
    licenseType: "Single-user personal & professional reading license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: true,
    createdAt: "2026-08-15T10:00:00Z",
    faqs: [
      {
        question: "Is this handbook updated for modern cloud stacks?",
        answer: "Yes, this edition incorporates Kubernetes container orchestrations, Kafka/Redpanda streaming patterns, distributed tracing with OpenTelemetry, and modern serverless hybrid considerations."
      },
      {
        question: "Are the diagrams vector format?",
        answer: "All 85+ architecture diagrams are embedded as crisp vector graphics in the PDF and included as standalone SVGs for team architecture reviews."
      }
    ],
    tags: ["System Design", "Microservices", "Cloud Architecture", "Backend Engineering"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-002",
    slug: "founders-playbook-zero-to-one",
    name: "Zero-to-One Founder Playbook: Validating & Launching Tech Products",
    category: "ebooks-guides",
    categoryLabel: "E-books & Guides",
    shortDescription: "Step-by-step framework to test value propositions, run customer discovery interviews, define MVP scope, and secure initial paying users.",
    fullDescription: "Avoid spending six months building software nobody wants. The Zero-to-One Founder Playbook provides an actionable roadmap from initial hypothesis to paying pilot customers. Includes exact scripts for non-leading user interviews, cold outreach templates that convert, lightweight landing page validation tactics, and unit economic benchmarks for bootstrapped and seed-stage software companies.",
    pricePaise: 59900,
    currency: "INR",
    coverVisualType: "playbook",
    coverGradient: "linear-gradient(135deg, #171138 0%, #431407 100%)",
    gallery: ["Interview Script Framework", "Landing Page Testing Funnel", "Unit Economic Calculator"],
    fileFormats: [".pdf", ".epub"],
    compatibility: "Compatible with all PDF and EPUB reading software across desktop, tablet, and mobile devices.",
    contents: [
      "210-page tactical founder manual (.pdf and .epub)",
      "Customer discovery interview questioning scripts (Word and Markdown)",
      "Early adopter agreement starter template",
      "Launch day distribution checklist covering 18 channels"
    ],
    licenseType: "Single-founder commercial license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-09-02T14:30:00Z",
    faqs: [
      {
        question: "Does this playbook apply to B2B or B2C products?",
        answer: "While the validation fundamentals apply broadly, the discovery interview frameworks and pricing models are tailored specifically for B2B SaaS and high-utility creator tools."
      }
    ],
    tags: ["Startups", "Product Management", "Validation", "Entrepreneurship"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-003",
    slug: "master-ai-prompt-vault-gpt4o-claude",
    name: "Enterprise Prompt Vault: 450+ Tested System Prompts for Engineers & PMs",
    category: "ai-prompts",
    categoryLabel: "AI Prompts & Resources",
    shortDescription: "Production-tested prompts for code refactoring, PR reviews, PRD drafting, SQL generation, and context-window optimization.",
    fullDescription: "Stop writing vague prompts that yield hallucinated or verbose code. The Enterprise Prompt Vault is a structured repository of 450+ multi-shot, role-conditioned prompts designed for advanced LLMs including GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro. Each prompt is battle-tested with few-shot inputs, negative constraints, and structured output schemas (JSON/Markdown) to produce reliable, high-yield results for day-to-day engineering and product management tasks.",
    pricePaise: 99900,
    currency: "INR",
    coverVisualType: "ai",
    coverGradient: "linear-gradient(135deg, #092c22 0%, #154c38 100%)",
    gallery: ["Prompt Taxonomy Tree", "Few-Shot Schema Example", "Benchmark Test Cards"],
    fileFormats: [".json", ".md", ".csv"],
    compatibility: "Works with OpenAI API, Anthropic Claude Workbench, Google AI Studio, Cursor, and any LLM chat interface.",
    contents: [
      "450+ formatted system & task prompts organized in categorized JSON and Markdown files",
      "Raw CSV spreadsheet for easy programmatic ingestion or vector search indexing",
      "Guide on chain-of-density and prompt compression techniques (35 pages)",
      "Prompt testing & regression evaluation matrix"
    ],
    licenseType: "Commercial team use license (up to 10 team members)",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: true,
    createdAt: "2026-09-18T09:15:00Z",
    faqs: [
      {
        question: "How are the prompts structured?",
        answer: "Each prompt includes an objective, system persona, input parameters, strict guardrails, few-shot demonstration examples, and expected output schemas."
      },
      {
        question: "Can these prompts be imported into developer tools?",
        answer: "Yes. We include a standard JSON format ready for import into prompt management tools, LangChain/LlamaIndex configs, or custom CLI scripts."
      }
    ],
    tags: ["AI Prompts", "LLM", "Claude 3.5", "GPT-4o", "Prompt Engineering"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-004",
    slug: "autonomous-coding-agent-prompts",
    name: "Autonomous Coding Agent Orchestration Workflows & Meta-Prompts",
    category: "ai-prompts",
    categoryLabel: "AI Prompts & Resources",
    shortDescription: "Meta-prompts and tool-use schemas for autonomous AI pair programming, test-driven iteration, and error recovery loops.",
    fullDescription: "Unleash the full power of agentic coding assistants. This collection of agent instructions, tool call schemas, and recursive review prompts provides a tested foundation for building autonomous coding pipelines. Features specialized agent personas: Test Author, Code Reviewer, Security Auditor, and Migration Engineer, complete with automated verification protocols to prevent infinite loops and regressions.",
    pricePaise: 84900,
    currency: "INR",
    coverVisualType: "ai",
    coverGradient: "linear-gradient(135deg, #1a0f3d 0%, #064e3b 100%)",
    gallery: ["Agent State Machine", "Tool Calling Schema Sample", "TDD Verification Flow"],
    fileFormats: [".json", ".yaml", ".md"],
    compatibility: "Compatible with Antigravity, Claude Code, Cursor, AutoGen, CrewAI, and LangGraph pipelines.",
    contents: [
      "28 specialized agent configuration files in YAML and JSON",
      "Self-correcting test-driven development (TDD) execution flow scripts",
      "Context compaction and memory management guidelines",
      "Interactive prompt playground template"
    ],
    licenseType: "Commercial developer license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-10-01T12:00:00Z",
    faqs: [
      {
        question: "Does this work with command-line agent tools?",
        answer: "Yes, system prompts and instructions are designed for direct inclusion in CLI agent prompt files or system message configurations."
      }
    ],
    tags: ["Agents", "Automation", "Developer Tools", "AI Workflows"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-005",
    slug: "finmodel-saas-metrics-valuation-projections",
    name: "SaaS Financial Modeling Suite: 5-Year Dynamic Projections & Unit Economics",
    category: "business-templates",
    categoryLabel: "Business Templates",
    shortDescription: "Institutional-grade financial model with cohort retention curves, CAC payback calculations, hiring plans, and runway forecasts.",
    fullDescription: "Prepare for investor due diligence or budget your runway with complete numerical clarity. Built by seasoned venture-backed finance leads, this 5-year financial model calculates monthly MRR/ARR bridge, customer churn cohorts, LTV/CAC ratios, headcount growth, and cash burn scenarios. Fully dynamic with clear input drivers, scenario toggle switches (Base, Bull, Bear), and automated presentation charts.",
    pricePaise: 149900,
    currency: "INR",
    coverVisualType: "finance",
    coverGradient: "linear-gradient(135deg, #2b1100 0%, #7c2d12 100%)",
    gallery: ["MRR Cohort Heatmap", "Headcount & Opex Matrix", "Investor Summary Dashboard"],
    fileFormats: [".xlsx", ".gsheet", ".pdf"],
    compatibility: "Fully compatible with Microsoft Excel 2019+ (PC/Mac) and Google Sheets. No external macro plugins required.",
    contents: [
      "Master financial projection workbook (.xlsx with 14 connected worksheets)",
      "Google Sheets one-click cloud copy link with protected formula cells",
      "User guide & formula cheat-sheet explaining SaaS benchmarks (.pdf)",
      "Ready-to-export investor board deck financial summary slides"
    ],
    licenseType: "Company-wide commercial operational license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: true,
    createdAt: "2026-07-20T11:45:00Z",
    faqs: [
      {
        question: "Are formulas locked or customizable?",
        answer: "All formulas are 100% unlocked and clearly documented with color-coded inputs, calculation rows, and summary outputs for complete auditability."
      },
      {
        question: "Does it support annual vs. monthly subscription mixes?",
        answer: "Yes, the revenue sheet includes a dedicated billing periodicity toggle that factors deferred revenue and actual cash flow timings."
      }
    ],
    tags: ["Finance", "SaaS Metrics", "Financial Model", "Excel", "Fundraising"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-006",
    slug: "tech-contract-legal-agreements-bundle",
    name: "Startup Legal Kit: MSA, SLA, Independent Contractor & NDA Starter Templates",
    category: "business-templates",
    categoryLabel: "Business Templates",
    shortDescription: "Comprehensive starter legal contract drafts annotated with clause-by-clause operational commentary and negotiation guidelines.",
    fullDescription: "Save tens of thousands in drafting fees by starting negotiations with clean, balanced tech commercial contracts. This bundle includes Master Services Agreements (MSA), Software License Agreements (SLA), Mutual Non-Disclosure Agreements (NDA), and Independent Contractor / Intellectual Property Assignment Agreements. Each clause includes annotations explaining risk trade-offs, standard limits of liability, and jurisdiction placeholders.",
    pricePaise: 129900,
    currency: "INR",
    coverVisualType: "legal",
    coverGradient: "linear-gradient(135deg, #1c1538 0%, #312e81 100%)",
    gallery: ["Contract Clause Breakdown", "Negotiation Matrix", "Plain English Summary"],
    fileFormats: [".docx", ".pdf"],
    compatibility: "Compatible with Microsoft Word, Google Docs, Apple Pages, and LibreOffice.",
    contents: [
      "4 core contract starter templates in editable .docx format",
      "Annotated negotiation guide highlighting key risk clauses (.pdf)",
      "Intellectual Property Assignment Exhibit template",
      "Clause fallback library with alternative compromise provisions"
    ],
    licenseType: "Commercial starter template license (requires final legal counsel review)",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-08-10T16:20:00Z",
    faqs: [
      {
        question: "Do I still need a lawyer?",
        answer: "Yes. These templates are starter business drafts intended to reduce billable drafting hours and clarify operational terms, but must be reviewed by qualified legal counsel in your specific jurisdiction prior to execution."
      }
    ],
    tags: ["Legal", "Contracts", "Agreements", "B2B SaaS", "Templates"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-007",
    slug: "notion-ultimate-engineering-workspace",
    name: "Ultimate Engineering & Product Hub for Notion: Sprint, Architecture & Docs",
    category: "productivity-tools",
    categoryLabel: "Productivity Tools",
    shortDescription: "Integrated Notion workspace featuring automated sprint velocity, incident post-mortems, RFC design docs, and team onboarding.",
    fullDescription: "Eliminate scattered documentation and broken wiki links. The Ultimate Engineering Hub connects product roadmaps directly to sprint execution tasks, architectural RFCs, tech debt backlogs, and on-call runbooks. Features synced databases, custom formula progress rings, automated sprint rollover views, and structured templates for engineering incident retrospectives.",
    pricePaise: 69900,
    currency: "INR",
    coverVisualType: "notion",
    coverGradient: "linear-gradient(135deg, #082836 0%, #0e7490 100%)",
    gallery: ["Sprint Agile Board", "RFC Repository Database", "Onboarding Hub Template"],
    fileFormats: [".notion-template", ".pdf"],
    compatibility: "Requires a free or paid Notion account. Installs instantly via standard Notion duplicate workspace link.",
    contents: [
      "Complete 8-module connected Notion workspace template",
      "Setup video walkthrough link and written deployment checklist (.pdf)",
      "Standard RFC architecture template and incident post-mortem template",
      "Engineering team skill matrix and leveling guide framework"
    ],
    licenseType: "Team workspace license (unlimited internal team members)",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: true,
    createdAt: "2026-08-28T13:10:00Z",
    faqs: [
      {
        question: "Can I use this with a free Notion plan?",
        answer: "Yes, all databases and relations function properly on both free and Notion Plus workspace plans."
      }
    ],
    tags: ["Notion", "Productivity", "Agile", "RFC", "Engineering Docs"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-008",
    slug: "obsidian-developer-second-brain-vault",
    name: "Developer Second Brain Obsidian Vault: Knowledge Graph & Daily Journal",
    category: "productivity-tools",
    categoryLabel: "Productivity Tools",
    shortDescription: "Pre-configured Obsidian vault with Zettelkasten note linking, Dataview queries, code snippet tagging, and daily review workflows.",
    fullDescription: "Turn fragmented bookmarks and terminal notes into an interconnected personal knowledge graph. This turnkey Obsidian vault comes pre-configured with curated community plugins, custom CSS theme styling, Dataview tables for language syntaxes, spaced repetition flashcard triggers, and automated daily note templates that effortlessly capture reading notes and technical insights.",
    pricePaise: 49900,
    currency: "INR",
    coverVisualType: "obsidian",
    coverGradient: "linear-gradient(135deg, #180d38 0%, #4c1d95 100%)",
    gallery: ["Interactive Knowledge Graph", "Dataview Snippet Index", "Daily Log Architecture"],
    fileFormats: [".zip", ".md"],
    compatibility: "Compatible with Obsidian v1.4+ on macOS, Linux, Windows, iOS, and Android.",
    contents: [
      "Ready-to-open Obsidian vault archive (.zip) with tested folder structure",
      "Pre-configured Dataview, Templater, and Omnisearch setups with zero-lag settings",
      "50 starter reference cards covering algorithms, Git commands, and HTTP standards",
      "16-page vault architecture manual explaining note classification"
    ],
    licenseType: "Single-user personal knowledge license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-09-12T08:00:00Z",
    faqs: [
      {
        question: "Is my data private with this vault?",
        answer: "100% private. Obsidian operates entirely on local plain text Markdown files stored on your machine. No cloud account or external telemetry is involved."
      }
    ],
    tags: ["Obsidian", "PKM", "Second Brain", "Markdown", "Developer Productivity"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-009",
    slug: "lumina-design-system-figma-pro",
    name: "Lumina UI Design System: 1,200+ Accessible Components & Design Tokens",
    category: "design-assets",
    categoryLabel: "Design & Creative Assets",
    shortDescription: "Figma design system with WCAG AAA contrast, auto-layout 5.0, variables for dark/light modes, and typed token exports for code.",
    fullDescription: "Accelerate product design with a system built from atomic principles up to complex enterprise dashboards. Lumina UI includes over 1,200 meticulously crafted components covering data tables, modal dialogs, navigation systems, charts, form controls, and state variants. Every element is linked to Figma variables with automated light/dark theme switching, and includes a matching W3C Design Tokens JSON file for React and CSS.",
    pricePaise: 199900,
    currency: "INR",
    coverVisualType: "design",
    coverGradient: "linear-gradient(135deg, #350826 0%, #be185d 100%)",
    gallery: ["Component Library Overview", "Variables & Tokens Studio", "Desktop & Mobile UI Grids"],
    fileFormats: [".fig", ".tokens.json", ".svg"],
    compatibility: "Compatible with Figma (Desktop and Web, 2024+ engine with Variables and Component Properties).",
    contents: [
      "Full Figma master file (.fig) with 1,200+ components and interactive variants",
      "W3C Design Tokens JSON export file for CSS variables and Tailwind syncing",
      "Icon set containing 350+ consistent SVG vectors on a 24px grid",
      "Typography scale presets and WCAG AAA color contrast audit documentation"
    ],
    licenseType: "Commercial project license (unlimited commercial projects)",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: true,
    createdAt: "2026-07-05T15:00:00Z",
    faqs: [
      {
        question: "Does this support Figma's latest variable and mode updates?",
        answer: "Yes! All color, spacing, and radius values are defined using Figma Variables, enabling instant 1-click toggling between Light and Dark themes."
      },
      {
        question: "Can my engineering team import the tokens into CSS?",
        answer: "Yes. We include `tokens.json` formatted to the W3C community standard, compatible with Style Dictionary, Tailwind CSS, and CSS Modules."
      }
    ],
    tags: ["Figma", "Design System", "UI Kit", "Tokens", "Accessibility"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-010",
    slug: "3d-neo-fintech-illustration-pack",
    name: "Neo-Fintech 3D Vector & Render Pack: 60 Custom Render Assets",
    category: "design-assets",
    categoryLabel: "Design & Creative Assets",
    shortDescription: "High-resolution transparent 3D illustrations covering security locks, digital currencies, analytics graphs, and credit cards.",
    fullDescription: "Elevate your landing pages and product interfaces with modern, tactile 3D renders. This pack provides 60 bespoke illustrations designed specifically for fintech, developer tooling, and modern SaaS platforms. Provided in ultra-high resolution transparent PNGs (4000x4000px) across two lighting angles (Studio Dark and Neon Glow), plus raw Blender source files with fully procedural shaders.",
    pricePaise: 119900,
    currency: "INR",
    coverVisualType: "illustration",
    coverGradient: "linear-gradient(135deg, #1b0a33 0%, #581c87 100%)",
    gallery: ["Card & Vault Renders", "Floating Currency Assets", "Blender Material Shaders"],
    fileFormats: [".png", ".blend", ".svg"],
    compatibility: "PNGs work in all graphics software; Blender source files require Blender 3.6+ (Cycles or Eevee).",
    contents: [
      "60 transparent 3D renders at 4000x4000px resolution in both Studio and Neon lighting",
      "Full Blender 3D project source files (.blend) with organized node networks",
      "Vector wireframe SVG companions for subtle background accents",
      "Commercial usage guide and attribution waiver"
    ],
    licenseType: "Extended commercial license (websites, mobile apps, marketing campaigns)",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-08-22T17:30:00Z",
    faqs: [
      {
        question: "Are textures and materials embedded in the Blender files?",
        answer: "Yes, all materials are 100% procedural or packed with embedded high-resolution normal and roughness maps."
      }
    ],
    tags: ["3D Renders", "Fintech", "Illustrations", "Blender", "Graphics"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-011",
    slug: "ambient-focus-soundscapes-creator-audio",
    name: "Deep Work Ambient Soundscapes: 12 Lossless Bio-Acoustic Audio Tracks",
    category: "other-downloads",
    categoryLabel: "Other Digital Downloads",
    shortDescription: "12 studio-mastered, 60-minute loopable soundscapes designed for sustained cognitive focus, coding sessions, and deep work.",
    fullDescription: "Engineered without disruptive rhythmic drops or harsh frequency peaks, this collection of 12 long-form ambient soundscapes provides the optimal acoustic backdrop for intense concentration. Mastered in high-resolution lossless audio (FLAC 24-bit/48kHz) and standard MP3, each track transitions seamlessly when looped in your favorite media player.",
    pricePaise: 39900,
    currency: "INR",
    coverVisualType: "audio",
    coverGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    gallery: ["Frequency Response Graph", "Tracklisting Overview", "Loop Boundary Details"],
    fileFormats: [".flac", ".wav", ".mp3"],
    compatibility: "Playable on any audio player, DAW, or mobile media app (Apple Music, VLC, QuickTime, Spotify local files).",
    contents: [
      "12 sixty-minute seamless loop audio tracks in lossless 24-bit FLAC",
      "12 sixty-minute 320kbps MP3 audio tracks for lightweight storage",
      "Acoustic frequency analysis and listening environment recommendations (.pdf)",
      "Royalty-free background synchronization license for podcasts and video tutorials"
    ],
    licenseType: "Personal focus & creator royalty-free sync license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-06-18T10:00:00Z",
    faqs: [
      {
        question: "Can I use these tracks as background music in YouTube videos or podcasts?",
        answer: "Yes! The included creator sync license permits royalty-free use as background audio in non-broadcast online video, streaming, and podcast content."
      }
    ],
    tags: ["Audio", "Deep Work", "Soundscapes", "Productivity", "Lossless"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  },
  {
    id: "de-prod-012",
    slug: "terminal-developer-productivity-dotfiles",
    name: "Optimized Linux & macOS Terminal Dotfiles, Zsh, Neovim & Tmux Presets",
    category: "other-downloads",
    categoryLabel: "Other Digital Downloads",
    shortDescription: "Clean, blazing-fast dotfiles configurations featuring sensible aliases, fuzzy navigation, Neovim LSP setup, and Tmux sessions.",
    fullDescription: "Step into a meticulously configured terminal environment tuned for velocity and ergonomics. Designed for Linux (Ubuntu/Debian/Fedora) and macOS, this dotfiles bundle provides modular Zsh configurations, fast prompt themes, ergonomic Tmux session management, and a robust Neovim configuration featuring Mason LSP installers, Telescope fuzzy finding, and Treesitter syntax highlighting.",
    pricePaise: 29900,
    currency: "INR",
    coverVisualType: "dotfiles",
    coverGradient: "linear-gradient(135deg, #0d1117 0%, #1f2937 100%)",
    gallery: ["Neovim IDE Layout", "Tmux Split Configuration", "Fuzzy Finder Keybindings"],
    fileFormats: [".tar.gz", ".sh", ".lua"],
    compatibility: "Compatible with Linux (x86_64/ARM64) and macOS. Requires Git, Zsh 5.8+, Neovim 0.9+, and Tmux 3.2+.",
    contents: [
      "Modular dotfiles archive (.tar.gz) with automated symlink installer script (`install.sh`)",
      "Safe rollback and backup script preserving existing configurations",
      "Complete Neovim Lua configuration with auto-configured LSP bindings",
      "Interactive printable cheat-sheet for Tmux and Neovim keybindings (.pdf)"
    ],
    licenseType: "Single-developer personal workstation license",
    deliveryMethod: "Instant secure digital download after verification",
    publicationStatus: "published",
    isFeatured: false,
    createdAt: "2026-09-25T14:00:00Z",
    faqs: [
      {
        question: "Will running the installer overwrite my existing configs?",
        answer: "No. The installer automatically detects existing files and moves them into a dated `~/.dotfiles.backup` directory before linking new files."
      }
    ],
    tags: ["Dotfiles", "Neovim", "Zsh", "Tmux", "Linux", "Developer Setup"],
    isDemoContent: true,
    demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview."
  }
];

// server/support/groundingContext.ts
function loadGroundedProducts() {
  try {
    let rawProducts = products_default;
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      const catalogPath = path.resolve(process.cwd(), "src/data/products.json");
      const raw = fs.readFileSync(catalogPath, "utf-8");
      rawProducts = JSON.parse(raw);
    }
    return rawProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryLabel: p.categoryLabel,
      priceINR: `\u20B9${(p.pricePaise / 100).toFixed(2)}`,
      pricePaise: p.pricePaise,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      fileFormats: p.fileFormats || [],
      compatibility: p.compatibility || "Universal modern software",
      contents: p.contents || [],
      licenseType: p.licenseType || "Standard digital license",
      isFeatured: !!p.isFeatured,
      tags: p.tags || [],
      faqs: p.faqs || []
    }));
  } catch (err) {
    console.error("[Support groundingContext] Failed to load product catalogue:", err);
    return [];
  }
}
function getStorePolicies() {
  return {
    storeName: "DigiEcom",
    storefrontStatus: "Demonstration Storefront Preview (Draft 1.0)",
    checkoutStatus: "Disabled. Real payments and file delivery are not active yet.",
    supportEmail: "digiecomsupport1@gmail.com",
    deliveryMethod: "Instant signed digital download link after order verification (once launched).",
    refundPolicy: "Refund requests will be reviewed individually under Indian consumer law for defective files, duplicate charges, or delivery failure.",
    jurisdiction: "India, subject to applicable e-commerce and consumer protection laws."
  };
}
function buildSystemPrompt(products, policies) {
  const productSummaries = products.map((p) => {
    const contentsStr = p.contents.slice(0, 3).join("; ");
    const faqsStr = p.faqs.map((f) => `Q: ${f.question} A: ${f.answer}`).join(" | ");
    return `- [${p.name}] (Slug: ${p.slug}, Price: ${p.priceINR}, Category: ${p.categoryLabel})
  Formats: ${p.fileFormats.join(", ")}
  Compatibility: ${p.compatibility}
  Includes: ${contentsStr}
  License: ${p.licenseType}
  FAQs: ${faqsStr || "None"}`;
  }).join("\n\n");
  return `You are the official AI Customer Support Assistant for "DigiEcom", a digital products storefront.

CRITICAL STOREFRONT FACTS & RULES:
1. STORE STATUS: DigiEcom is currently operating as a DEMONSTRATION STOREFRONT PREVIEW. Purchases, commercial checkout, and real file deliveries are DISABLED. All items are demonstration records.
2. HONESTY: Never claim that a payment was processed, an order was shipped, or digital files were delivered.
3. GROUNDED CATALOGUE: Recommend and describe ONLY the 12 products listed below. NEVER invent product names, prices, features, compatibility, or inclusions.
4. PRICES: All prices are strictly in INR (\u20B9).
5. SECURITY: NEVER ask for or accept credit/debit card numbers, CVVs, passwords, OTPs, or sensitive credentials.
6. CONTACT & ESCALATIONS: If a query cannot be answered or requires human review, direct the user to email: ${policies.supportEmail}.
7. MULTILINGUAL SUPPORT:
   - Prefer the language used by the user: English, Hindi, or Hinglish.
   - If the user asks in Hinglish (e.g., "kya included hai?", "Figma ke liye kya hai?", "checkout chal raha hai?"), respond in warm, polite Hinglish.
   - If the user asks in Hindi (Devanagari), respond in Hindi.
   - If the user asks in English, respond in English.
8. FORMATTING: Use clean Markdown (bullet points, bold text). When recommending a product, reference its slug or path: [Product Name](/products/{slug}). Do not output raw HTML tags.

VERIFIED PRODUCT CATALOGUE:
${productSummaries}

STORE POLICIES:
- Store: ${policies.storeName}
- Status: ${policies.storefrontStatus}
- Checkout Status: ${policies.checkoutStatus}
- Support Email: ${policies.supportEmail}
- Delivery Method: ${policies.deliveryMethod}
- Refund Scope: ${policies.refundPolicy}
- Jurisdiction: ${policies.jurisdiction}`;
}

// server/support/aiProvider.ts
var CatalogueFallbackProvider = class {
  name = "catalogue-fallback";
  isConfigured() {
    return true;
  }
  async generateReply(options) {
    const query = options.userMessage.toLowerCase().trim();
    const products = loadGroundedProducts();
    const policies = getStorePolicies();
    const lang = options.detectedLanguage;
    const isHinglishOrHindi = lang === "hi" || lang === "hinglish" || /\b(kya|kaise|kitna|hai|bhai|nahi|chal|milega|mujhe|chahiye|shukriya|namaste|dhanyawad)\b/i.test(query);
    if (query.includes("checkout") || query.includes("buy") || query.includes("khareed") || query.includes("purchase") || query.includes("payment") || query.includes("pay") || query.includes("order") || query.includes("delivery")) {
      if (isHinglishOrHindi) {
        return `**Store Status Notice:**
DigiEcom filhal ek **Demonstration Storefront Preview** hai. Real checkout, payment processing, aur digital file delivery abhi **disabled** hain.

- Saare listings sirf demo products hain.
- Asli payments ya credit/debit card details kabhi share na karein.
- Kisi bhi queries ke liye aap humari team ko **${policies.supportEmail}** par email kar sakte hain.`;
      }
      return `**Store Status Notice:**
DigiEcom is currently operating as a **Demonstration Storefront Preview**. Real checkout, commercial payment processing, and digital product delivery are **disabled**.

- All product listings are demonstration records.
- Please do not enter real payment cards or sensitive information.
- For store inquiries, please contact our team at **${policies.supportEmail}**.`;
    }
    if (query.includes("refund") || query.includes("cancellation") || query.includes("cancel") || query.includes("wapas")) {
      if (isHinglishOrHindi) {
        return `**Refund aur Cancellation Policy (Draft):**
Storefront demonstration phase me koi asli transaction initiate nahi hoti. Commercial launch ke baad:
- Defective/corrupted files ya duplicate payments par refund review kiya jayega.
- Digital products intangible hote hain, par Indian consumer protection laws ke mutabiq valid grievances handle honge.
- Queries ke liye support email: **${policies.supportEmail}**.`;
      }
      return `**Refund & Cancellation Policy (Draft):**
Because DigiEcom is currently in preview, no real purchases or refund transactions can occur. Following commercial launch:
- Refund requests will be reviewed individually under Indian law for defective/corrupted files, duplicate charges, or delivery failure.
- Inquiries can be directed to **${policies.supportEmail}**.`;
    }
    const matchedProducts = products.filter((p) => {
      const q = query;
      return p.name.toLowerCase().includes(q) || p.slug.includes(q.replace(/\s+/g, "-")) || p.categoryLabel.toLowerCase().includes(q) || p.fileFormats.some((f) => q.includes(f.replace(".", ""))) || p.tags?.some((t) => q.includes(t.toLowerCase())) || q.includes("ai") && p.categoryLabel.toLowerCase().includes("ai") || q.includes("prompt") && p.slug.includes("prompt") || q.includes("figma") && p.compatibility.toLowerCase().includes("figma") || q.includes("excel") && p.compatibility.toLowerCase().includes("excel") || q.includes("notion") && p.compatibility.toLowerCase().includes("notion") || q.includes("system design") && p.slug.includes("system-design") || q.includes("founder") && p.slug.includes("founder");
    });
    if (matchedProducts.length > 0) {
      const topProducts = matchedProducts.slice(0, 3);
      if (isHinglishOrHindi) {
        let reply2 = `Humare catalogue me ye relevant digital products available hain:

`;
        topProducts.forEach((p) => {
          reply2 += `### [${p.name}](/products/${p.slug})
`;
          reply2 += `- **Price:** ${p.priceINR} (Demo preview)
`;
          reply2 += `- **Category:** ${p.categoryLabel}
`;
          reply2 += `- **File Formats:** ${p.fileFormats.join(", ")}
`;
          reply2 += `- **Compatibility:** ${p.compatibility}
`;
          reply2 += `- **Includes:** ${p.contents[0] || "Complete digital asset package"}

`;
        });
        reply2 += `*Dhyan rahe: Abhi checkout disabled hai, aap [Full Details](/products/${topProducts[0].slug}) par jakar sample preview dekh sakte hain.*`;
        return reply2;
      }
      let reply = `Here are the matching digital products from our verified catalogue:

`;
      topProducts.forEach((p) => {
        reply += `### [${p.name}](/products/${p.slug})
`;
        reply += `- **Price:** ${p.priceINR} (Demonstration record)
`;
        reply += `- **Category:** ${p.categoryLabel}
`;
        reply += `- **File Formats:** ${p.fileFormats.join(", ")}
`;
        reply += `- **Compatibility:** ${p.compatibility}
`;
        reply += `- **Package Includes:** ${p.contents[0] || "Complete digital package"}

`;
      });
      reply += `*Note: Purchases are disabled in this demonstration storefront. You can inspect sample previews on the product detail page.*`;
      return reply;
    }
    if (query.includes("compatibility") || query.includes("requirements") || query.includes("software") || query.includes("chalega")) {
      if (isHinglishOrHindi) {
        return `**Compatibility Information:**
DigiEcom ke digital products standard, modern software ke liye design kiye gaye hain:
- **E-books & Guides:** Apple Books, Kindle, Adobe Acrobat, aur standard EPUB/PDF readers.
- **Spreadsheet Models:** Microsoft Excel (2019+) aur Google Sheets.
- **Design Assets:** Figma (Desktop/Web 2024+) aur standard SVG/PNG viewers.
- **AI Prompts:** OpenAI ChatGPT, Anthropic Claude, Google Gemini, aur Cursor.
- **Developer Dotfiles:** macOS aur Linux (Zsh, Neovim, Tmux).

Aap kisi bhi product card par **Preview** click karke specific software requirements dekh sakte hain!`;
      }
      return `**Software Compatibility Overview:**
DigiEcom digital products are crafted for standard modern software:
- **E-books & Guides:** Apple Books, Kindle, Adobe Acrobat, and any modern PDF/EPUB reader.
- **Spreadsheets:** Microsoft Excel (2019+) and Google Sheets without external macros.
- **Design Assets:** Figma (Desktop & Web 2024+ engine) plus standard SVG/PNG formats.
- **AI Prompts:** OpenAI, Claude, Google Gemini, and Cursor LLM interfaces.
- **Developer Configs:** Linux and macOS (Zsh, Neovim, Tmux).

Click **Preview** on any product card to see its exact compatibility specs!`;
    }
    if (query.includes("included") || query.includes("content") || query.includes("kya milega") || query.includes("what is included")) {
      if (isHinglishOrHindi) {
        return `**Package Inclusions:**
Har product ke sath digital package contents clearly listed hain:
- Full documentation aur practitioner guides (.pdf/.epub).
- Clean source files, editable templates, ya high-res vectors.
- Single-user personal ya developer commercial reading licenses.

Catalogue me explore karne ke liye aap [All Products](/products) dekh sakte hain!`;
      }
      return `**Package Inclusions:**
Every DigiEcom product package includes verified digital deliverables:
- DRM-free digital guides (.pdf and .epub).
- Clean unlocked source templates (Excel/Figma/Dotfiles).
- Clear licensing documentation.

You can browse all 12 products in our [Digital Products Catalogue](/products).`;
    }
    if (isHinglishOrHindi) {
      return `Namaste! Main DigiEcom ka AI Support Assistant hoon.

Aap mujhse pooch sakte hain:
- Product recommendations (jaise AI prompts, system design handbook, financial model).
- File formats aur software compatibility (.pdf, .epub, Excel, Figma).
- Package inclusions aur store policies.

*Store status: DigiEcom demonstration storefront hai; purchases filhal disabled hain. Kisi human inquiry ke liye email: **${policies.supportEmail}**.*`;
    }
    return `Hello! I'm your DigiEcom Customer Support Assistant.

I can help you with:
- Finding digital products (e.g., System Design Handbook, AI Prompt Vaults, Excel Models, Figma Kits).
- Checking file formats and software compatibility.
- Explaining package inclusions and licensing scopes.

*Store status: DigiEcom is currently a demonstration storefront preview with checkout disabled. For support escalation, contact **${policies.supportEmail}**.*`;
  }
};
var GeminiProvider = class {
  name = "gemini";
  apiKey;
  model;
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }
  isConfigured() {
    return !!this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes("placeholder");
  }
  async generateReply(options) {
    if (!this.isConfigured()) {
      throw new Error("Gemini API key is not configured in server environment");
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const contents = [];
    const systemInstruction = {
      parts: [{ text: options.systemPrompt }]
    };
    const recentHistory = options.conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: options.userMessage }]
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600
          }
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText.slice(0, 200)}`);
      }
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply || typeof reply !== "string") {
        throw new Error("Received empty reply from Gemini API");
      }
      return reply.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
};
var OpenAICompatibleProvider = class {
  name = "openai-compatible";
  apiKey;
  baseURL;
  model;
  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
    this.baseURL = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    this.model = process.env.AI_MODEL || "gpt-4o-mini";
  }
  isConfigured() {
    return !!this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes("placeholder");
  }
  async generateReply(options) {
    if (!this.isConfigured()) {
      throw new Error("AI_API_KEY is not configured in server environment");
    }
    const messages = [
      { role: "system", content: options.systemPrompt },
      ...options.conversationHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      })),
      { role: "user", content: options.userMessage }
    ];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.3,
          max_tokens: 600
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Provider returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
      }
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply || typeof reply !== "string") {
        throw new Error("Received empty reply from AI provider");
      }
      return reply.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
};

// server/support/chatService.ts
var ChatService = class {
  fallbackProvider;
  primaryProvider = null;
  constructor() {
    this.fallbackProvider = new CatalogueFallbackProvider();
    this.initializePrimaryProvider();
  }
  /**
   * Selects the best configured AI provider based on environment variables.
   */
  initializePrimaryProvider() {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) {
      this.primaryProvider = gemini;
      return;
    }
    const openAi = new OpenAICompatibleProvider();
    if (openAi.isConfigured()) {
      this.primaryProvider = openAi;
      return;
    }
    this.primaryProvider = null;
  }
  /**
   * Detects whether user message is English, Hindi (Devanagari), or Hinglish.
   */
  detectLanguage(text, requested) {
    if (requested && requested !== "auto") {
      return requested;
    }
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi";
    }
    const hinglishPattern = /\b(kya|kaise|kitna|kitne|hai|hain|bhai|nahi|nhn|chal|chalta|milega|mil|mujhe|chahiye|shukriya|namaste|dhanyawad|kripya|batao|bataiye|aur|lekin|kab|karein|kare)\b/i;
    if (hinglishPattern.test(text)) {
      return "hinglish";
    }
    return "en";
  }
  /**
   * Sanitizes and validates user input.
   */
  validateInput(request) {
    if (!request || typeof request !== "object") {
      return { isValid: false, error: "Invalid request body" };
    }
    if (!request.message || typeof request.message !== "string") {
      return { isValid: false, error: "Message is required and must be a string" };
    }
    const trimmed = request.message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: "Message cannot be empty" };
    }
    if (trimmed.length > 500) {
      return { isValid: false, error: "Message exceeds maximum length of 500 characters" };
    }
    return { isValid: true };
  }
  /**
   * Checks if user message appears to contain sensitive payment card info.
   */
  containsSensitiveInfo(text) {
    const cardRegex = /\b(?:\d[ -]*?){13,19}\b/;
    return cardRegex.test(text);
  }
  /**
   * Main entry point to process a customer support message.
   */
  async handleSupportMessage(request) {
    const validation = this.validateInput(request);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid request");
    }
    const userMessage = request.message.trim();
    const detectedLanguage = this.detectLanguage(userMessage, request.preferredLanguage);
    const products = loadGroundedProducts();
    const policies = getStorePolicies();
    if (this.containsSensitiveInfo(userMessage)) {
      const warningReply = detectedLanguage === "hi" || detectedLanguage === "hinglish" ? `\u26A0\uFE0F **Security Alert:** DigiEcom support par kabhi bhi credit/debit card numbers, CVV ya passwords share na karein. Humara storefront demonstration mode me hai aur real payments process nahi karta.` : `\u26A0\uFE0F **Security Notice:** Please never submit credit/debit card numbers, CVVs, or passwords in chat. DigiEcom operates as a demonstration storefront and will never ask for sensitive financial credentials.`;
      return {
        reply: warningReply,
        suggestedFollowUps: ["Is checkout available?", "What is included?", "Contact human support"],
        providerUsed: "catalogue-fallback",
        isLiveAiConnected: false,
        languageDetected: detectedLanguage,
        confidence: "high"
      };
    }
    const conversationHistory = [];
    if (Array.isArray(request.conversationHistory)) {
      for (const turn of request.conversationHistory.slice(-6)) {
        if (turn && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string") {
          conversationHistory.push({
            role: turn.role,
            content: turn.content.slice(0, 500)
          });
        }
      }
    }
    const systemPrompt = buildSystemPrompt(products, policies);
    let reply = "";
    let providerUsed = "catalogue-fallback";
    let isLiveAiConnected = false;
    let confidence = "fallback";
    this.initializePrimaryProvider();
    if (this.primaryProvider && this.primaryProvider.isConfigured()) {
      try {
        reply = await this.primaryProvider.generateReply({
          userMessage,
          conversationHistory,
          systemPrompt,
          detectedLanguage
        });
        providerUsed = this.primaryProvider.name === "gemini" ? "gemini" : "openai-compatible";
        isLiveAiConnected = true;
        confidence = "high";
      } catch (err) {
        console.warn(
          `[Support Chat] Primary AI provider (${this.primaryProvider.name}) failed, falling back to catalogue knowledge base.`,
          err?.message || err
        );
        reply = await this.fallbackProvider.generateReply({
          userMessage,
          conversationHistory,
          systemPrompt,
          detectedLanguage
        });
        providerUsed = "catalogue-fallback";
        isLiveAiConnected = false;
        confidence = "fallback";
      }
    } else {
      reply = await this.fallbackProvider.generateReply({
        userMessage,
        conversationHistory,
        systemPrompt,
        detectedLanguage
      });
      providerUsed = "catalogue-fallback";
      isLiveAiConnected = false;
      confidence = "fallback";
    }
    const recommendedProductSlugs = this.extractProductSlugs(reply, products, userMessage);
    const suggestedFollowUps = this.generateSuggestedFollowUps(userMessage, reply, detectedLanguage);
    return {
      reply,
      suggestedFollowUps,
      recommendedProductSlugs,
      providerUsed,
      isLiveAiConnected,
      languageDetected: detectedLanguage,
      confidence
    };
  }
  /**
   * Identifies product slugs relevant to the answer.
   */
  extractProductSlugs(reply, products, query) {
    const slugs = /* @__PURE__ */ new Set();
    const lowerReply = reply.toLowerCase();
    const lowerQuery = query.toLowerCase();
    for (const p of products) {
      if (lowerReply.includes(p.slug) || lowerReply.includes(p.name.toLowerCase()) || lowerQuery.includes(p.slug) || lowerQuery.includes(p.name.toLowerCase())) {
        slugs.add(p.slug);
      }
    }
    return Array.from(slugs).slice(0, 4);
  }
  /**
   * Generates context-appropriate follow-up question suggestions.
   */
  generateSuggestedFollowUps(userMessage, reply, lang) {
    const isHindiOrHinglish = lang === "hi" || lang === "hinglish";
    const lower = (userMessage + " " + reply).toLowerCase();
    if (lower.includes("checkout") || lower.includes("buy") || lower.includes("payment")) {
      return isHindiOrHinglish ? ["Products me kya included hai?", "Software compatibility kya hai?", "Support email kya hai?"] : ["What is included?", "What are the compatibility requirements?", "How do I contact support?"];
    }
    if (lower.includes("compatibility") || lower.includes("software")) {
      return isHindiOrHinglish ? ["Is checkout available?", "Package me kya milega?", "Help me find a product"] : ["Is checkout available?", "What is included?", "Help me find a product"];
    }
    if (lower.includes("included") || lower.includes("contents")) {
      return isHindiOrHinglish ? ["Software compatibility kya hai?", "Is checkout available?", "Refund policy kya hai?"] : ["What are the compatibility requirements?", "Is checkout available?", "What is the refund policy?"];
    }
    return isHindiOrHinglish ? ["Help me find a product", "What is included?", "What are the compatibility requirements?", "Is checkout available?"] : ["Help me find a product", "What is included?", "What are the compatibility requirements?", "Is checkout available?"];
  }
};
var supportChatService = new ChatService();

// server/support/rateLimiter.ts
var SlidingWindowRateLimiter = class {
  windowMs;
  maxRequests;
  clients = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 1e3;
    this.maxRequests = options.maxRequests || 20;
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs * 2);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
  /**
   * Check if client exceeds limit, and record current request if allowed.
   */
  checkLimit(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let record = this.clients.get(clientId);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(clientId, record);
    }
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0] || now;
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs
      };
    }
    record.timestamps.push(now);
    const remaining = this.maxRequests - record.timestamps.length;
    return {
      allowed: true,
      remaining,
      resetMs: this.windowMs
    };
  }
  /**
   * Reset limits for a specific client (useful for tests)
   */
  reset(clientId) {
    if (clientId) {
      this.clients.delete(clientId);
    } else {
      this.clients.clear();
    }
  }
  /**
   * Cleanup resources when destroying limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clients.clear();
  }
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [clientId, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.clients.delete(clientId);
      }
    }
  }
};
var supportRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 25
});

// server/support/whatsappAdapter.ts
var WhatsAppAdapter = class {
  verifyToken;
  accessToken;
  phoneNumberId;
  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "digiecom_verify_token_preview";
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  }
  /**
   * Validates the Meta / WhatsApp Cloud API webhook challenge handshake (GET request).
   */
  verifyWebhook(params) {
    if (params.mode === "subscribe" && params.token && params.token === this.verifyToken) {
      return {
        isValid: true,
        challenge: params.challenge
      };
    }
    return { isValid: false };
  }
  /**
   * Parses inbound webhook payload, safely extracting messages.
   */
  parseInboundMessages(payload) {
    if (!payload || payload.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) {
      return [];
    }
    const messages = [];
    for (const entry of payload.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const incoming = change?.value?.messages;
          if (Array.isArray(incoming)) {
            for (const msg of incoming) {
              if (msg && msg.from && msg.text?.body) {
                messages.push(msg);
              }
            }
          }
        }
      }
    }
    return messages;
  }
  /**
   * Formats response text specifically for mobile WhatsApp messaging.
   * Converts markdown links [Name](/products/slug) to readable WhatsApp format.
   */
  formatForWhatsApp(response) {
    let text = response.reply;
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
    if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
      text += `

Suggested questions:
${response.suggestedFollowUps.map((q) => `\u2022 ${q}`).join("\n")}`;
    }
    if (text.length > 1e3) {
      text = text.substring(0, 995) + "...";
    }
    return text;
  }
  /**
   * Processes an incoming WhatsApp text message through the unified chat service
   * and prepares the outbound WhatsApp Cloud API payload.
   */
  async handleInboundMessage(message) {
    const text = message.text?.body?.trim();
    if (!text) {
      return null;
    }
    const supportResult = await supportChatService.handleSupportMessage({
      message: text
    });
    const formattedBody = this.formatForWhatsApp(supportResult);
    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.from,
      type: "text",
      text: {
        preview_url: false,
        body: formattedBody
      }
    };
  }
  /**
   * Sends a message via the Meta WhatsApp Cloud API if credentials are configured.
   * If credentials are not configured, returns a mock dispatch result without making fake network calls.
   */
  async sendOutboundMessage(outbound) {
    if (!this.accessToken || !this.phoneNumberId) {
      return {
        success: true,
        dispatched: false,
        reason: "WhatsApp API credentials not configured in environment. Outbound message created but not sent."
      };
    }
    try {
      const endpoint = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(outbound)
      });
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          dispatched: false,
          reason: `Meta API returned ${response.status}: ${errorText.substring(0, 150)}`
        };
      }
      const data = await response.json();
      return {
        success: true,
        dispatched: true,
        messageId: data.messages?.[0]?.id
      };
    } catch (err) {
      return {
        success: false,
        dispatched: false,
        reason: err.message || "Network error sending WhatsApp message"
      };
    }
  }
};
var whatsappAdapter = new WhatsAppAdapter();

// server/supportApi.ts
function handleSupportApi(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  const rawUrl = req.url || "/";
  const parsedUrl = new URL(rawUrl, "http://localhost");
  const pathname = parsedUrl.pathname;
  if (req.method === "GET" && (pathname === "/health" || pathname.endsWith("/health"))) {
    const hasGemini = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("placeholder");
    const hasOpenAI = !!process.env.AI_API_KEY && !process.env.AI_API_KEY.includes("placeholder");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "DigiEcom AI Customer Support",
        activeProvider: hasGemini ? "gemini" : hasOpenAI ? "openai-compatible" : "catalogue-fallback",
        isLiveAiConnected: hasGemini || hasOpenAI,
        storefrontStatus: "Demonstration Preview Only",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      })
    );
    return;
  }
  if (req.method === "GET" && (pathname === "/whatsapp" || pathname.endsWith("/whatsapp"))) {
    const mode = parsedUrl.searchParams.get("hub.mode") || void 0;
    const token = parsedUrl.searchParams.get("hub.verify_token") || void 0;
    const challenge = parsedUrl.searchParams.get("hub.challenge") || void 0;
    const verification = whatsappAdapter.verifyWebhook({ mode, token, challenge });
    if (verification.isValid && verification.challenge) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(verification.challenge);
      return;
    }
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Webhook verification token mismatch or invalid mode" }));
    return;
  }
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      let parsedBody = {};
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: "Malformed JSON payload" }));
          return;
        }
      }
      if (req.method === "POST" && (pathname === "/chat" || pathname.endsWith("/chat") || pathname === "")) {
        const forwarded = req.headers["x-forwarded-for"];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown-client";
        const rateCheck = supportRateLimiter.checkLimit(ip);
        if (!rateCheck.allowed) {
          res.statusCode = 429;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Retry-After", Math.ceil(rateCheck.resetMs / 1e3).toString());
          res.end(
            JSON.stringify({
              success: false,
              error: "Rate limit exceeded. Please wait a moment before sending another message.",
              resetMs: rateCheck.resetMs
            })
          );
          return;
        }
        const chatRequest = parsedBody;
        const validation = supportChatService.validateInput(chatRequest);
        if (!validation.isValid) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: validation.error }));
          return;
        }
        const response = await supportChatService.handleSupportMessage(chatRequest);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, data: response }));
        return;
      }
      if (req.method === "POST" && (pathname === "/whatsapp" || pathname.endsWith("/whatsapp"))) {
        const messages = whatsappAdapter.parseInboundMessages(parsedBody);
        const results = [];
        for (const msg of messages) {
          const outbound = await whatsappAdapter.handleInboundMessage(msg);
          if (outbound) {
            const dispatchResult = await whatsappAdapter.sendOutboundMessage(outbound);
            results.push({ to: msg.from, outbound, dispatchResult });
          }
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: "EVENT_RECEIVED", processed: results.length, details: results }));
        return;
      }
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Support API route not found: ${pathname}` }));
    } catch (err) {
      console.error("[Support API error]:", err?.message || err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          error: "An internal error occurred while processing the support request."
        })
      );
    }
  });
}
export {
  handleSupportApi
};

export default function handler(req, res) { return handleSupportApi(req, res); }

