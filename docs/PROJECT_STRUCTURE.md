# 📁 FinSight X AI - Project Structure

## Overview
This document provides a comprehensive overview of the project's file structure, following Next.js 15 best practices with TypeScript.

---

## 🗂️ Root Directory

```
FinSight-X-AI/
├── 📄 Configuration Files
├── 📁 src/                    # Source code (Next.js App Router)
├── 📁 public/                 # Static assets
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Utility scripts
├── 📁 tests/                  # Test files
├── 📁 backend/                # Python backend (optional)
├── 📁 drizzle/                # Database migrations
└── 📁 node_modules/           # Dependencies
```

---

## 📄 Configuration Files

```
Root/
├── package.json              # NPM dependencies & scripts
├── package-lock.json         # Locked dependencies
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.mjs        # PostCSS configuration
├── components.json           # shadcn/ui configuration
├── drizzle.config.ts         # Drizzle ORM configuration
├── vitest.config.ts          # Vitest test configuration
├── eslint.config.mjs         # ESLint configuration
├── middleware.ts             # Next.js middleware
├── next-env.d.ts             # Next.js type definitions
├── vercel.json               # Vercel deployment config
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
├── .env.local                # Local overrides
├── .gitignore                # Git ignore rules
└── .vercelignore             # Vercel ignore rules
```

---

## 📁 Source Directory (`/src`)

### Structure

```
src/
├── app/                      # Next.js 15 App Router
│   ├── (routes)/            # Route groups
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── dashboard/           # Dashboard-specific
│   ├── enterprise/          # Enterprise features
│   ├── ui/                  # shadcn/ui components
│   └── Logo.tsx             # Shared components
│
├── lib/                     # Utilities & helpers
│   ├── ai-engine.ts         # AI processing engine
│   ├── alpha-vantage.ts     # Market data API
│   ├── utils.ts             # General utilities
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic
│   └── types/               # TypeScript types
│
├── db/                      # Database
│   ├── schema.ts            # Drizzle schema
│   ├── index.ts             # DB connection
│   ├── migrations/          # SQL migrations
│   └── seeds/               # Seed data
│
├── hooks/                   # Global React hooks
│   └── useRealtimeAlerts.ts # Alert system hook
│
├── middleware/              # Custom middleware
│   └── apiAuth.ts           # API authentication
│
└── visual-edits/            # Visual editing configs
```

---

## 🛤️ App Router (`/src/app`)

### Landing & Auth

```
app/
├── page.tsx                 # Landing page (/)
├── layout.tsx               # Root layout
├── globals.css              # Global CSS
│
├── login/
│   └── page.tsx             # Login page (/login)
│
├── register/
│   └── page.tsx             # Register page (/register)
│
└── pricing/
    └── page.tsx             # Pricing page (/pricing)
```

### Dashboard Routes

```
app/dashboard/
├── page.tsx                 # Main dashboard (/dashboard)
│
├── advanced-features/
│   └── page.tsx             # Advanced features showcase
│
├── advanced-features-simple/
│   └── page.tsx             # Lightweight features page
│
├── ai-analytics/
│   └── page.tsx             # AI analytics dashboard
│
├── companies/
│   └── page.tsx             # Companies list
│
├── company/
│   └── [id]/
│       └── page.tsx         # Company details (dynamic)
│
├── document/
│   └── [id]/
│       └── page.tsx         # Document details (dynamic)
│
├── portfolio/
│   └── page.tsx             # Portfolio management
│
├── support/
│   └── page.tsx             # Support center
│
└── settings/
    ├── organization/
    │   └── page.tsx         # Org settings
    ├── team/
    │   └── page.tsx         # Team management
    ├── api-keys/
    │   └── page.tsx         # API key management
    └── billing/
        └── page.tsx         # Billing settings
```

### Admin Routes

```
app/admin/
└── dashboard/
    └── page.tsx             # Admin dashboard (/admin/dashboard)
```

### Enterprise Routes

```
app/enterprise-features/
└── page.tsx                 # Enterprise features (/enterprise-features)
```

---

## 🔌 API Routes (`/src/app/api`)

### Document Management

```
api/documents/
├── route.ts                 # GET /api/documents (list)
│                            # POST /api/documents (upload)
├── [id]/
│   ├── route.ts             # GET /api/documents/:id
│   ├── analysis/
│   │   └── route.ts         # GET /api/documents/:id/analysis
│   └── download/
│       └── route.ts         # GET /api/documents/:id/download
│
├── analyze/
│   └── route.ts             # POST /api/documents/analyze
│                            # PUT /api/documents/analyze (batch)
└── compare/
    └── route.ts             # POST /api/documents/compare
```

### AI & Intelligence

```
api/
├── ai/
│   ├── route.ts             # POST /api/ai (chat)
│   └── usage/
│       └── route.ts         # GET /api/ai/usage
│
├── ai-agent-logs/
│   └── route.ts             # GET /api/ai-agent-logs
│
├── intelligence/
│   └── extract/
│       └── route.ts         # POST /api/intelligence/extract
│
├── fraud/
│   └── detect/
│       └── route.ts         # POST /api/fraud/detect
│
├── multi-agent-analysis/
│   └── route.ts             # POST /api/multi-agent-analysis
│
├── semantic-search/
│   └── route.ts             # POST /api/semantic-search
│
└── explainable-ai/
    └── route.ts             # GET /api/explainable-ai
```

### Search & Analysis

```
api/
├── search/
│   └── advanced/
│       └── route.ts         # POST /api/search/advanced
│
├── search-queries/
│   └── route.ts             # GET /api/search-queries
│
├── document-analysis/
│   ├── route.ts             # POST /api/document-analysis
│   └── by-company/
│       └── route.ts         # GET /api/document-analysis/by-company
│
└── analyze-document/
    └── route.ts             # POST /api/analyze-document
```

### Companies & Portfolios

```
api/
├── companies/
│   ├── route.ts             # GET /api/companies (list)
│   │                        # POST /api/companies (create)
│   └── [id]/
│       ├── route.ts         # GET /api/companies/:id
│       └── benchmarks/
│           └── route.ts     # GET /api/companies/:id/benchmarks
│
├── portfolio/
│   ├── route.ts             # GET /api/portfolio
│   │                        # POST /api/portfolio (create)
│   └── holdings/
│       └── route.ts         # GET /api/portfolio/holdings
│
└── benchmarks/
    └── route.ts             # GET /api/benchmarks
```

### Market Data

```
api/market-data/
├── quote/
│   └── route.ts             # GET /api/market-data/quote?symbol=X
└── news/
    └── route.ts             # GET /api/market-data/news
```

### Financials & Forecasts

```
api/
├── financials/
│   └── route.ts             # GET /api/financials?symbol=X
│
├── forecast/
│   └── route.ts             # GET /api/forecast
│                            # POST /api/forecast
│
└── financial-metrics/
    └── route.ts             # GET /api/financial-metrics
```

### Alerts & Notifications

```
api/
├── alerts/
│   ├── route.ts             # GET /api/alerts (list)
│   │                        # POST /api/alerts (create)
│   ├── acknowledge/
│   │   └── route.ts         # POST /api/alerts/acknowledge
│   └── resolve/
│       └── route.ts         # POST /api/alerts/resolve
│
├── alert-rules/
│   └── route.ts             # GET /api/alert-rules
│                            # POST /api/alert-rules
│
└── notifications/
    ├── route.ts             # GET /api/notifications
    └── send/
        └── route.ts         # POST /api/notifications/send
```

### Organizations & Teams

```
api/
├── organizations/
│   ├── route.ts             # GET /api/organizations
│   │                        # POST /api/organizations
│   └── [id]/
│       ├── route.ts         # GET /api/organizations/:id
│       │                    # PATCH /api/organizations/:id
│       └── members/
│           ├── route.ts     # GET /api/organizations/:id/members
│           └── invite/
│               └── route.ts # POST /api/organizations/:id/members/invite
│
└── invitations/
    ├── route.ts             # GET /api/invitations
    └── accept/
        └── route.ts         # POST /api/invitations/accept
```

### Authentication & Authorization

```
api/auth/
├── [...all]/
│   └── route.ts             # Catch-all auth routes
│
└── admin/
    ├── register/
    │   └── route.ts         # POST /api/auth/admin/register
    └── cleanup/
        └── route.ts         # POST /api/auth/admin/cleanup
```

### Compliance & Governance

```
api/
├── compliance-checks/
│   └── route.ts             # GET /api/compliance-checks
│                            # POST /api/compliance-checks
│
└── governance/
    ├── route.ts             # GET /api/governance
    ├── audit-logs/
    │   └── route.ts         # GET /api/governance/audit-logs
    └── bias-report/
        └── route.ts         # GET /api/governance/bias-report
```

### Knowledge Graph

```
api/knowledge-graph/
├── route.ts                 # GET /api/knowledge-graph
├── entities/
│   └── route.ts             # GET /api/knowledge-graph/entities
└── relationships/
    └── route.ts             # GET /api/knowledge-graph/relationships
```

### Miscellaneous

```
api/
├── dashboard/
│   └── stats/
│       └── route.ts         # GET /api/dashboard/stats
│
├── demo-setup/
│   └── route.ts             # GET /api/demo-setup
│                            # POST /api/demo-setup
│
├── chat/
│   └── route.ts             # POST /api/chat
│
├── ocr/
│   └── route.ts             # POST /api/ocr
│
├── collaboration/
│   └── route.ts             # GET /api/collaboration
│                            # POST /api/collaboration
│
├── document-versions/
│   └── route.ts             # GET /api/document-versions
│
├── feature-flags/
│   └── route.ts             # GET /api/feature-flags
│
├── role-views/
│   └── route.ts             # GET /api/role-views
│
├── api-keys/
│   └── route.ts             # GET /api/api-keys
│                            # POST /api/api-keys
│
├── billing/
│   ├── route.ts             # GET /api/billing
│   ├── checkout/
│   │   └── route.ts         # POST /api/billing/checkout
│   ├── portal/
│   │   └── route.ts         # POST /api/billing/portal
│   └── usage/
│       └── route.ts         # GET /api/billing/usage
│
├── support/
│   ├── route.ts             # GET /api/support
│   └── tickets/
│       └── route.ts         # POST /api/support/tickets
│
├── reports/
│   └── generate/
│       └── route.ts         # POST /api/reports/generate
│
├── webhooks/
│   └── route.ts             # POST /api/webhooks
│
├── stocks/
│   └── search/
│       └── route.ts         # GET /api/stocks/search
│
└── v1/                      # API versioning
    └── documents/
        └── route.ts         # GET /api/v1/documents
```

---

## 🧩 Components (`/src/components`)

### Dashboard Components

```
components/dashboard/
├── AdvancedSearch.tsx              # Advanced search UI
├── AIAgentsPanel.tsx               # AI agents display
├── AlertsPanel.tsx                 # Alerts sidebar
├── BatchDocumentUpload.tsx         # Batch upload
├── ChatInterface.tsx               # Chat widget
├── CitationTracker.tsx             # Citation display
├── CollaborationPanel.tsx          # Team collaboration
├── CompanyDatabasePanel.tsx        # Company list
├── DocumentComparison.tsx          # Doc comparison
├── DocumentIntelligenceDashboard.tsx # Intelligence UI
├── DocumentIntelligencePanel.tsx   # Intelligence widget
├── DocumentUpload.tsx              # Single upload
├── ExplainableAIPanel.tsx          # AI explanation
├── FilesPanel.tsx                  # Files list
├── FinancialDataPanel.tsx          # Financial data
├── FinancialReportsPanel.tsx       # Reports
├── FraudDetectionPanel.tsx         # Fraud display
├── GovernancePanel.tsx             # Governance UI
├── HistoryPanel.tsx                # Activity history
├── NotificationCenterPanel.tsx     # Notifications
├── NotificationsPopover.tsx        # Notification popup
├── PredictiveAnalyticsPanel.tsx    # Predictions
├── ReportGenerationPanel.tsx       # Report generator
├── SemanticSearchPanel.tsx         # Semantic search
└── SettingsDialog.tsx              # Settings modal
```

### Enterprise Components

```
components/enterprise/
└── (Enterprise-specific components)
```

### UI Components (shadcn/ui)

```
components/ui/
├── accordion.tsx
├── alert.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── select.tsx
├── separator.tsx
├── sheet.tsx
├── tabs.tsx
├── textarea.tsx
├── toast.tsx
└── toaster.tsx
```

### Shared Components

```
components/
├── Logo.tsx                 # App logo (SVG)
└── CommandPalette.tsx       # Global command menu
```

---

## 🛠️ Library (`/src/lib`)

### Core Libraries

```
lib/
├── ai-engine.ts             # AI processing engine
│   ├── analyzeText()
│   ├── extractEntities()
│   ├── detectAnomalies()
│   ├── calculateRiskScore()
│   ├── compareDocuments()
│   └── batchAnalyze()
│
├── alpha-vantage.ts         # Market data API client
│   ├── getStockQuote()
│   ├── getCompanyOverview()
│   ├── getIncomeStatement()
│   └── getBalanceSheet()
│
└── utils.ts                 # General utilities
    ├── cn()                 # Class name merger
    └── formatDate()
```

### Hooks

```
lib/hooks/
└── (Custom hooks)
```

### Services

```
lib/services/
└── (Business logic services)
```

### Types

```
lib/types/
└── (TypeScript type definitions)
```

---

## 🗄️ Database (`/src/db`)

```
db/
├── index.ts                 # DB connection & exports
├── schema.ts                # Drizzle schema definitions
│   ├── organizations
│   ├── users
│   ├── documents
│   ├── alerts
│   ├── companies
│   ├── financial_metrics
│   ├── forecasts
│   ├── portfolio_items
│   ├── alert_rules
│   └── ai_agent_logs
│
├── migrations/              # SQL migration files
│   ├── 0000_initial.sql
│   ├── 0001_add_users.sql
│   └── ...
│
└── seeds/                   # Seed data scripts
    └── demo-data.ts
```

---

## 🪝 Hooks (`/src/hooks`)

```
hooks/
└── useRealtimeAlerts.ts     # Real-time alert polling
```

---

## 📚 Documentation (`/docs`)

```
docs/
├── README.md                          # Main documentation
├── TECH_STACK_AND_FEATURES.md         # Complete tech guide
├── AI_FEATURES_ENHANCEMENT.md         # AI capabilities
├── API_KEYS_GUIDE.md                  # API setup guide
├── API_STATUS.md                      # API status
├── DEPLOYMENT.md                      # Deployment guide
├── FREE_APIS_SETUP.md                 # Free API setup
├── QUICK_API_SETUP.md                 # Quick start
├── SECURITY_NOTICE.md                 # Security info
├── README.deployment.md               # Deployment readme
├── REAL_TIME_FEATURES.md              # Real-time guide
├── IMPROVEMENTS_ROADMAP.md            # Future plans
├── ENTERPRISE_BUILD_COMPLETE.md       # Enterprise features
├── ENTERPRISE_IMPLEMENTATION_STATUS.md # Implementation status
├── ADMIN_UI_COMPLETE.md               # Admin UI guide
├── AI_ENTERPRISE_PHASE_COMPLETE.md    # AI enterprise phase
├── FEATURES_COMPLETE_AND_WORKING.md   # Features list
├── HEBBIA_INSPIRED_FEATURES.md        # Advanced features
├── HEBBIA_FEATURES_IMPLEMENTATION_COMPLETE.md # Implementation
├── MIGRATION_SUMMARY.md               # Migration guide
├── PYTHON_BACKEND_COMPLETE.md         # Python backend
└── PYTHON_BACKEND_SETUP.md            # Backend setup
```

---

## 🧪 Tests (`/tests`)

```
tests/
├── setup.ts                 # Test configuration
│
├── unit/                    # Unit tests
│   └── report-generator.test.ts
│
├── integration/             # Integration tests
│   └── (Integration tests)
│
└── e2e/                     # End-to-end tests
    └── (E2E tests)
```

---

## 🐍 Python Backend (`/backend`) [Optional]

```
backend/
├── README.md                # Backend documentation
├── requirements.txt         # Python dependencies
├── main.py                  # FastAPI entry point
│
├── api/                     # API endpoints
│   └── routes.py
│
├── config/                  # Configuration
│   └── settings.py
│
├── models/                  # Data models
│   └── schemas.py
│
├── services/                # Business logic
│   └── document_parser.py
│
├── utils/                   # Utilities
│   └── helpers.py
│
├── tests/                   # Tests
│   └── test_api.py
│
└── venv/                    # Virtual environment
```

---

## 🛠️ Scripts (`/scripts`)

```
scripts/
├── seed.ts                  # Database seeding script
└── test-alpha-vantage.ts    # API testing script
```

---

## 🌐 Public (`/public`)

```
public/
├── favicon.ico              # Site favicon
├── robots.txt               # SEO robots file
└── (Static assets)
```

---

## 🗃️ Database Migrations (`/drizzle`)

```
drizzle/
├── meta/                    # Migration metadata
│   ├── _journal.json
│   ├── 0000_snapshot.json
│   └── ...
└── (Migration SQL files)
```

---

## 🎯 File Naming Conventions

### TypeScript/React Files
- **Components**: PascalCase (`Logo.tsx`, `AdvancedSearch.tsx`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **Utilities**: camelCase (`ai-engine.ts`, `alpha-vantage.ts`)
- **API Routes**: lowercase (`route.ts`)

### CSS Files
- **Global**: `globals.css`
- **Modules**: `*.module.css` (if using CSS modules)

### Configuration
- **JSON**: lowercase (`package.json`, `tsconfig.json`)
- **TypeScript**: PascalCase or lowercase (`Next.config.ts`)

---

## 📦 Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage:**
```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button'

// Instead of: import { db } from '../../../db'
import { db } from '@/db'

// Instead of: import { AIEngine } from '../../../lib/ai-engine'
import { AIEngine } from '@/lib/ai-engine'
```

---

## 🚀 Build Output

```
.next/                       # Next.js build output (gitignored)
├── cache/                   # Build cache
├── server/                  # Server bundles
├── static/                  # Static assets
└── types/                   # Generated types
```

---

## 🔒 Gitignored Files

```
# Dependencies
/node_modules
/backend/venv

# Build output
/.next
/out
/build

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
/.idea
/.vscode
*.swp
*.swo

# Testing
/coverage

# Production
/dist
```

---

## 📊 Project Statistics

- **Total Files**: 200+
- **Components**: 40+
- **API Endpoints**: 80+
- **Database Tables**: 10
- **Documentation Pages**: 20+
- **Lines of Code**: 25,000+

---

## 🎯 Best Practices Implemented

### ✅ Code Organization
- Feature-based folder structure
- Clear separation of concerns
- Consistent naming conventions
- Centralized utilities
- Reusable components

### ✅ TypeScript
- Strict type checking
- Interface definitions
- Type-safe API routes
- Proper generic usage

### ✅ Next.js 15
- App Router structure
- Server/Client components
- API routes organization
- Metadata optimization
- Image optimization

### ✅ Performance
- Code splitting
- Lazy loading
- Optimized imports
- Caching strategies

### ✅ Security
- Environment variables
- API authentication
- Input validation
- SQL injection prevention
- XSS protection

### ✅ Maintainability
- Comprehensive documentation
- Consistent coding style
- Modular architecture
- Easy to extend
- Clear dependencies

---

## 🔍 Quick Navigation

### Most Important Directories:
1. **`/src/app`** - All pages and routes
2. **`/src/components`** - Reusable UI components
3. **`/src/lib`** - Core business logic
4. **`/src/db`** - Database schema and queries
5. **`/docs`** - All documentation

### Most Important Files:
1. **`/src/app/page.tsx`** - Landing page
2. **`/src/app/dashboard/page.tsx`** - Main dashboard
3. **`/src/lib/ai-engine.ts`** - AI processing engine
4. **`/src/db/schema.ts`** - Database schema
5. **`/package.json`** - Project configuration

---

## 📝 Summary

The project follows a **clean, scalable, and maintainable** architecture:

✅ **Organized** - Clear folder structure
✅ **Modular** - Easy to extend and maintain
✅ **Type-Safe** - Full TypeScript coverage
✅ **Documented** - Comprehensive documentation
✅ **Scalable** - Ready for enterprise use
✅ **Best Practices** - Industry standards followed

---

**Last Updated:** November 16, 2024
**Version:** 2.0
**Status:** Production Ready 🚀
