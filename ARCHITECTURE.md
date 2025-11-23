# FinsightX AI - Architecture Documentation

## Project Structure

This document outlines the proper, scalable file structure for the FinsightX AI platform.

### Overview

```
FinsightX Ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth-related routes (grouped)
│   │   ├── (marketing)/       # Public marketing pages (grouped)
│   │   ├── dashboard/         # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI primitives
│   │   ├── features/         # Feature-specific components
│   │   │   ├── documents/    # Document management
│   │   │   ├── analytics/    # Analytics & charts
│   │   │   ├── chat/        # Chat interfaces
│   │   │   ├── reports/     # Report generation
│   │   │   ├── fraud/       # Fraud detection
│   │   │   ├── compliance/  # Compliance tools
│   │   │   └── ai/          # AI-powered features
│   │   ├── layouts/         # Layout components
│   │   └── shared/          # Shared/common components
│   │
│   ├── lib/                  # Core utilities and services
│   │   ├── api/             # API client utilities
│   │   ├── services/        # Business logic services
│   │   │   ├── ai/          # AI services
│   │   │   ├── documents/   # Document services
│   │   │   ├── analytics/   # Analytics services
│   │   │   └── financial/   # Financial data services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   ├── constants/       # Constants and configs
│   │   └── validators/      # Validation schemas
│   │
│   ├── middleware/           # Middleware functions
│   ├── styles/              # Global styles
│   └── config/              # Configuration files
│
├── public/                   # Static assets
├── prisma/                   # Database schema
├── tests/                    # Test files
└── docs/                     # Documentation
```

## Current Issues

### 1. Components Organization
**Problem**: 43 components in `/src/components/dashboard` - too many files in one folder

**Solution**: Organize by feature domain
```
components/
├── features/
│   ├── documents/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentIntelligence.tsx
│   │   ├── BatchUpload.tsx
│   │   ├── DocumentComparison.tsx
│   │   └── CitationTracker.tsx
│   │
│   ├── analytics/
│   │   ├── AnalyticsCharts.tsx
│   │   ├── PredictiveAnalytics.tsx
│   │   ├── FinancialReports.tsx
│   │   └── FinancialDataPanel.tsx
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatCopilot.tsx (from enterprise/)
│   │   └── index.ts
│   │
│   ├── reports/
│   │   ├── ReportGeneration.tsx
│   │   ├── AnalysisReports.tsx
│   │   └── index.ts
│   │
│   ├── fraud/
│   │   ├── FraudDetection.tsx
│   │   ├── RealTimeFraudMonitor.tsx (from enterprise/)
│   │   └── AnomalyDetection.tsx
│   │
│   ├── compliance/
│   │   ├── CompliancePanel.tsx
│   │   ├── MultiLanguageCompliance.tsx (from enterprise/)
│   │   └── AlertRules.tsx
│   │
│   ├── ai/
│   │   ├── AIAgents.tsx
│   │   ├── ExplainableAI.tsx
│   │   ├── AIPlaybooks.tsx (from enterprise/)
│   │   ├── SemanticSearch.tsx
│   │   └── AdvancedSearch.tsx
│   │
│   ├── company/
│   │   ├── CompanyManagement.tsx
│   │   ├── CompanyDatabase.tsx
│   │   ├── CompanyAlerts.tsx
│   │   └── CompanyDocumentUpload.tsx
│   │
│   ├── collaboration/
│   │   ├── Collaboration.tsx
│   │   ├── DocumentAnnotations.tsx
│   │   └── index.ts
│   │
│   ├── governance/
│   │   ├── Governance.tsx
│   │   ├── LLMUsageMonitor.tsx (from enterprise/)
│   │   └── index.ts
│   │
│   └── notifications/
│       ├── NotificationCenter.tsx
│       ├── NotificationsPopover.tsx
│       └── Alerts.tsx
```

### 2. API Routes Organization
**Problem**: Flat structure with ~50 API routes

**Solution**: Group by domain
```
api/
├── v1/                        # Versioned API
│   ├── documents/
│   │   ├── route.ts          # GET /api/v1/documents
│   │   ├── [id]/
│   │   │   ├── route.ts      # GET/PATCH/DELETE /api/v1/documents/[id]
│   │   │   ├── analysis/route.ts
│   │   │   └── download/route.ts
│   │   ├── analyze/route.ts
│   │   └── compare/route.ts
│   │
│   ├── ai/
│   │   ├── chat/route.ts
│   │   ├── analyze/route.ts
│   │   ├── agents/route.ts
│   │   └── explainable/route.ts
│   │
│   ├── analytics/
│   │   ├── stats/route.ts
│   │   ├── financial-metrics/route.ts
│   │   ├── forecasts/route.ts
│   │   └── benchmarks/route.ts
│   │
│   ├── fraud/
│   │   ├── detect/route.ts
│   │   └── monitor/route.ts
│   │
│   ├── compliance/
│   │   ├── checks/route.ts
│   │   └── reports/route.ts
│   │
│   ├── search/
│   │   ├── semantic/route.ts
│   │   ├── advanced/route.ts
│   │   └── queries/route.ts
│   │
│   └── companies/
│       ├── route.ts
│       └── [id]/
│           ├── route.ts
│           └── benchmarks/route.ts
│
├── auth/                      # Authentication
│   └── [...all]/route.ts
│
├── webhooks/                  # External webhooks
│   └── route.ts
│
└── health/                    # Health check
    └── route.ts
```

### 3. Lib Organization
**Problem**: Mixed utilities and services in root of `/src/lib`

**Solution**: Proper separation
```
lib/
├── services/                  # Business logic
│   ├── ai/
│   │   ├── engine.ts
│   │   ├── embeddings.ts
│   │   └── index.ts
│   │
│   ├── documents/
│   │   ├── intelligence.ts
│   │   ├── ocr.ts
│   │   └── index.ts
│   │
│   ├── financial/
│   │   ├── alpha-vantage.ts
│   │   ├── fmp.ts
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── pinecone.ts
│   │   └── index.ts
│   │
│   └── external/
│       └── webhooks.ts
│
├── api/                       # API client utilities
│   ├── client.ts
│   ├── fetcher.ts
│   └── index.ts
│
├── auth/                      # Auth utilities
│   ├── client.ts
│   ├── server.ts
│   └── index.ts
│
├── hooks/                     # Custom React hooks
│   └── index.ts
│
├── utils/                     # Utility functions
│   ├── formatting.ts
│   ├── validation.ts
│   ├── cn.ts                  # className utility
│   └── index.ts
│
├── types/                     # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   ├── components.ts
│   └── index.ts
│
├── constants/                 # Constants
│   ├── routes.ts
│   ├── features.ts
│   └── index.ts
│
└── validators/                # Validation schemas
    ├── document.ts
    ├── user.ts
    └── index.ts
```

## Naming Conventions

### Files
- **Components**: PascalCase (`DocumentUpload.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: camelCase with `.types.ts` (`api.types.ts`)
- **Constants**: camelCase with `.constants.ts` (`routes.constants.ts`)
- **Hooks**: camelCase starting with `use` (`useDocuments.ts`)

### Folders
- **kebab-case** for feature folders (`fraud-detection/`)
- **camelCase** for utility folders (`utils/`)

### Exports
- Use **barrel exports** (`index.ts`) for cleaner imports
- Group related exports

## Import Aliases

Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/features/*": ["./src/components/features/*"],
      "@/ui/*": ["./src/components/ui/*"],
      "@/services/*": ["./src/lib/services/*"],
      "@/hooks/*": ["./src/lib/hooks/*"],
      "@/utils/*": ["./src/lib/utils/*"],
      "@/types/*": ["./src/lib/types/*"]
    }
  }
}
```

## Best Practices

### 1. Feature-First Organization
Group by **feature/domain**, not by technical role

❌ Bad:
```
components/
├── panels/
├── dialogs/
└── forms/
```

✅ Good:
```
features/
├── documents/
├── analytics/
└── fraud/
```

### 2. Co-location
Keep related files together
```
features/
└── documents/
    ├── DocumentUpload.tsx
    ├── DocumentUpload.test.tsx
    ├── DocumentUpload.styles.ts
    ├── useDocumentUpload.ts
    └── index.ts
```

### 3. Barrel Exports
Use `index.ts` for cleaner imports
```typescript
// features/documents/index.ts
export { DocumentUpload } from './DocumentUpload';
export { DocumentIntelligence } from './DocumentIntelligence';
export { BatchUpload } from './BatchUpload';
```

### 4. Single Responsibility
One component/utility per file

### 5. Consistent Naming
Follow naming conventions strictly

## Migration Strategy

1. **Create new structure** without breaking existing code
2. **Gradually move components** with proper imports
3. **Update import paths** using automated tools
4. **Test thoroughly** after each migration
5. **Deprecate old paths** gradually
6. **Remove old structure** after full migration

## Component Categories

### Features (`components/features/`)
Domain-specific, business logic components

### UI (`components/ui/`)
Reusable, generic UI primitives (Shadcn)

### Layouts (`components/layouts/`)
Layout components (DashboardLayout, AuthLayout)

### Shared (`components/shared/`)
Shared components used across features (Header, Footer, Nav)

## Next Steps

1. ✅ Document current structure (this file)
2. Create new folder structure
3. Move components systematically
4. Update import paths
5. Test all features
6. Remove deprecated code
7. Update team documentation

## Benefits

✅ **Scalability**: Easy to add new features
✅ **Maintainability**: Clear organization
✅ **Developer Experience**: Easy to find files
✅ **Performance**: Better code splitting
✅ **Collaboration**: Clear ownership
✅ **Testing**: Easier to test features in isolation

---

**Last Updated**: 2025-01-23
**Version**: 1.0
**Author**: FinsightX AI Team
