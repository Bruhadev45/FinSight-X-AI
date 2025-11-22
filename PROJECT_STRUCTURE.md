# FinsightX AI - Project Structure

## Overview
FinsightX AI is a comprehensive financial intelligence platform built with Next.js 15, React 19, and TypeScript. This document outlines the complete project structure and organization.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5 (App Router with Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend
- **API**: Next.js API Routes + Python FastAPI (optional)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **AI/ML**: OpenAI GPT-4, LangChain, TensorFlow.js
- **Vector Database**: Pinecone
- **File Processing**: pdf-parse, pdf-lib, Tesseract.js
- **Notifications**: Twilio (SMS), Resend (Email)

## Directory Structure

```
FinsightX-AI/
├── .claude/                    # Claude AI configuration
├── .github/                    # GitHub workflows and templates
├── .next/                      # Next.js build output (gitignored)
├── backend/                    # Python FastAPI backend (optional)
│   ├── api/                   # API endpoints
│   ├── models/                # Data models
│   ├── services/              # Business logic
│   └── utils/                 # Utility functions
├── docs/                       # Documentation
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # System architecture
│   └── PROJECT_STRUCTURE.md   # This file
├── drizzle/                    # Database migrations
│   └── migrations/            # SQL migration files
├── node_modules/              # Dependencies (gitignored)
├── public/                     # Static assets
│   ├── images/                # Image files
│   ├── fonts/                 # Custom fonts
│   └── icons/                 # Icon files
├── scripts/                    # Utility scripts
│   ├── seed.ts                # Database seeding
│   └── test-*.ts              # Testing scripts
├── src/                        # Source code
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Authentication routes
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Signup page
│   │   ├── (dashboard)/      # Dashboard routes
│   │   │   ├── analytics/    # Analytics pages
│   │   │   ├── documents/    # Document management
│   │   │   ├── alerts/       # Alert management
│   │   │   └── settings/     # Settings pages
│   │   ├── api/              # API Routes
│   │   │   ├── ai/           # AI-related endpoints
│   │   │   ├── alerts/       # Alert endpoints
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── documents/    # Document endpoints
│   │   │   ├── organizations/# Organization endpoints
│   │   │   ├── portfolio/    # Portfolio endpoints
│   │   │   └── ...           # Other endpoints
│   │   ├── fonts/            # Font definitions
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx    # Button component
│   │   │   ├── card.tsx      # Card component
│   │   │   ├── dialog.tsx    # Dialog component
│   │   │   └── ...           # Other UI components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── documents/        # Document components
│   │   ├── charts/           # Chart components
│   │   └── layout/           # Layout components
│   ├── db/                    # Database configuration
│   │   ├── index.ts          # Database client
│   │   └── schema.ts         # Database schema
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── utils.ts          # General utilities
│   │   ├── alpha-vantage.ts  # Stock API integration
│   │   ├── openai.ts         # OpenAI integration
│   │   ├── pinecone.ts       # Vector database
│   │   └── services/         # Business logic services
│   │       ├── collaboration.ts
│   │       ├── notification.ts
│   │       └── ...
│   └── styles/                # Additional styles
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── utils/                      # Utility functions
├── .env                        # Environment variables (gitignored)
├── .env.example               # Environment variables template
├── .env.local                 # Local environment variables (gitignored)
├── .gitignore                 # Git ignore rules
├── .gitattributes             # Git attributes
├── components.json            # shadcn/ui configuration
├── CONTRIBUTING.md            # Contribution guidelines
├── DEPLOYMENT.md              # Deployment guide
├── drizzle.config.ts          # Drizzle ORM configuration
├── eslint.config.mjs          # ESLint configuration
├── LICENSE                    # License file
├── middleware.ts              # Next.js middleware
├── next.config.ts             # Next.js configuration
├── next-env.d.ts              # Next.js TypeScript definitions
├── package.json               # Project dependencies
├── package-lock.json          # Dependency lock file
├── postcss.config.mjs         # PostCSS configuration
├── PROJECT_STRUCTURE.md       # This file
├── README.md                  # Project README
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
└── vitest.config.ts           # Vitest test configuration
```

## Key Directories Explained

### `/src/app/`
Next.js 15 App Router directory containing all pages and API routes.

**Route Groups (parentheses):**
- `(auth)/` - Authentication related pages
- `(dashboard)/` - Protected dashboard pages
- These groupings don't affect the URL structure

**API Routes:**
Located in `/src/app/api/`, each directory represents an API endpoint:
- `GET /api/documents` → `api/documents/route.ts` (GET handler)
- `POST /api/documents` → `api/documents/route.ts` (POST handler)
- `GET /api/documents/[id]` → `api/documents/[id]/route.ts`

### `/src/components/`
Reusable React components organized by feature:

- **`ui/`** - Base UI components from shadcn/ui
- **Feature folders** - Components grouped by feature (auth, dashboard, documents, etc.)
- **`layout/`** - Layout components (Header, Sidebar, Footer)

### `/src/lib/`
Utility functions and service integrations:

- **`auth.ts`** - Better Auth configuration
- **`utils.ts`** - Helper functions (cn, formatters, etc.)
- **`services/`** - Business logic services
- **Integration files** - Third-party API integrations (OpenAI, Pinecone, etc.)

### `/src/db/`
Database configuration and schema:

- **`index.ts`** - Drizzle database client configuration
- **`schema.ts`** - Database table definitions using Drizzle ORM

### `/backend/` (Optional)
Python FastAPI backend for heavy AI/ML operations:

- **`api/`** - FastAPI route handlers
- **`models/`** - Pydantic models
- **`services/`** - Python business logic
- **`utils/`** - Python utilities

### `/public/`
Static assets served from root URL:
- `/public/logo.png` → accessible at `/logo.png`

### `/tests/`
Test files using Vitest:
- **`unit/`** - Unit tests for individual functions/components
- **`integration/`** - Integration tests for features

## Database Schema

### Core Tables

1. **users** - User accounts (Better Auth)
2. **sessions** - User sessions (Better Auth)
3. **accounts** - OAuth accounts (Better Auth)
4. **organizations** - Multi-tenant organizations
5. **organization_members** - Organization memberships
6. **documents** - Uploaded financial documents
7. **document_analysis** - AI analysis results
8. **financial_metrics** - Extracted financial data
9. **companies** - Company information
10. **alerts** - Risk and compliance alerts
11. **alert_rules** - Alert configuration
12. **compliance_checks** - Compliance verification
13. **ai_agent_logs** - AI agent execution logs
14. **notifications** - User notifications
15. **reports** - Generated reports
16. **portfolios** - Investment portfolios
17. **portfolio_holdings** - Portfolio stock holdings
18. **feature_flags** - Feature toggles
19. **support_tickets** - Customer support
20. **webhooks** - Webhook configurations

### Relationships

```
organizations (1) ──< (N) organization_members
organizations (1) ──< (N) documents
documents (1) ──< (N) document_analysis
documents (1) ──< (N) financial_metrics
companies (1) ──< (N) documents
companies (1) ──< (N) alerts
users (1) ──< (N) portfolios
portfolios (1) ──< (N) portfolio_holdings
```

## API Routes Structure

### Authentication (`/api/auth`)
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/cleanup` - Cleanup sessions

### Documents (`/api/documents`)
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/[id]` - Get document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/analyze` - Analyze document
- `GET /api/documents/[id]/download` - Download report

### AI & Analysis (`/api/ai`)
- `POST /api/ai/analyze` - AI analysis
- `GET /api/ai/usage` - Usage statistics
- `POST /api/multi-agent-analysis` - Multi-agent analysis
- `POST /api/fraud/detect` - Fraud detection

### Organizations (`/api/organizations`)
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/[id]` - Get organization
- `PUT /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization
- `GET /api/organizations/[id]/members` - List members
- `DELETE /api/organizations/[id]/members` - Remove member
- `POST /api/organizations/[id]/members/invite` - Invite member

### Portfolio (`/api/portfolio`)
- `GET /api/portfolio` - List portfolios
- `POST /api/portfolio` - Create portfolio
- `POST /api/portfolio/holdings` - Add stock
- `DELETE /api/portfolio/holdings` - Remove stock

### Alerts (`/api/alerts`)
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts` - Update alert
- `DELETE /api/alerts` - Delete alert
- `POST /api/alerts/acknowledge` - Acknowledge alert
- `POST /api/alerts/resolve` - Resolve alert

### Market Data (`/api/market-data`)
- `GET /api/market-data/quote` - Get stock quote
- `GET /api/market-data/news` - Get market news

## Configuration Files

### `next.config.ts`
Next.js configuration including:
- Turbopack settings
- Image optimization
- Environment variables
- Redirects and rewrites

### `drizzle.config.ts`
Drizzle ORM configuration:
- Database connection
- Migration settings
- Schema location

### `tsconfig.json`
TypeScript configuration:
- Path aliases (`@/` → `./src/`)
- Compiler options
- Type checking rules

### `tailwind.config.ts`
Tailwind CSS configuration:
- Custom colors
- Theme extensions
- Plugin configuration

### `components.json`
shadcn/ui configuration:
- Component registry
- Style preferences
- Import aliases

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth encryption key
- `OPENAI_API_KEY` - OpenAI API access
- `PINECONE_API_KEY` - Vector database access

### Optional Variables
- `TWILIO_*` - SMS notifications
- `RESEND_API_KEY` - Email notifications
- `STRIPE_*` - Payment processing
- Financial API keys (FMP, Alpha Vantage, etc.)

## Development Workflow

### 1. Local Development
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

### 2. Database Operations
```bash
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

### 3. Code Quality
```bash
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm test             # Run tests
npm run test:ui      # Tests with UI
npm run test:coverage # Coverage report
```

## Best Practices

### File Naming
- **Components**: PascalCase (`Button.tsx`, `DocumentCard.tsx`)
- **Utilities**: camelCase (`utils.ts`, `formatDate.ts`)
- **API Routes**: kebab-case folders, `route.ts` file
- **Types**: PascalCase with `.types.ts` suffix

### Import Organization
```typescript
// 1. External imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal imports
import { formatDate } from '@/lib/utils';
import type { Document } from '@/types';

// 3. Relative imports
import { DocumentCard } from './DocumentCard';
```

### Component Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Helper functions
// 5. Exports
```

## CI/CD Pipeline

### GitHub Actions (if configured)
- **Build Check**: Runs on every PR
- **Type Check**: TypeScript validation
- **Lint**: ESLint validation
- **Tests**: Unit and integration tests
- **Deploy**: Auto-deploy on merge to main

### Vercel Integration
- **Preview Deployments**: Every PR gets a preview URL
- **Production**: Auto-deploy from main branch
- **Analytics**: Built-in performance monitoring

## Security Considerations

### API Routes
- All routes use proper authentication checks
- Input validation with Zod
- Rate limiting on sensitive endpoints
- CSRF protection via Better Auth

### Database
- Parameterized queries via Drizzle ORM
- Connection pooling
- SSL connections in production

### Environment
- Secrets never committed to Git
- Environment variables validated at runtime
- Separate configs for dev/staging/production

## Performance Optimization

### Frontend
- React Server Components for reduced bundle size
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Font optimization with next/font

### Backend
- Database query optimization
- API route caching where appropriate
- Vector search with Pinecone for fast document retrieval
- Connection pooling for database

### Build
- Turbopack for faster development builds
- Production builds optimized with SWC
- Static page generation where possible

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`

**Database Issues:**
- Check connection string in `.env`
- Run migrations: `npm run db:push`
- Check PostgreSQL is running

**Type Errors:**
- Run type check: `npx tsc --noEmit`
- Check import paths use `@/` alias
- Ensure all dependencies are installed

---

**Last Updated**: November 2024
**Next.js Version**: 15.3.5
**React Version**: 19.0.0
