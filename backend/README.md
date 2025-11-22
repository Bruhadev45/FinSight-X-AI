# FinSight AI - Python FastAPI Backend

Enterprise-grade financial analysis and compliance platform powered by AI.

## Features

- **Multi-Agent AI Analysis System** - 6 specialized AI agents for comprehensive document analysis
- **Government-Compliant Reports** - 7 types of regulatory reports (SEC, IRS, IFRS, GAAP)
- **Real-time Portfolio Tracking** - Live stock data and portfolio management
- **Fraud Detection** - AI-powered irregularity detection
- **Compliance Monitoring** - Automated regulatory compliance checks
- **Webhook System** - Event-driven integrations
- **Usage Tracking** - Plan-based AI usage limits and monitoring

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL with SQLAlchemy
- **AI**: OpenAI GPT-4o-mini
- **Cache**: Redis
- **Deployment**: Docker + Docker Compose

## Quick Start

### 1. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:
- FastAPI backend on port 8000
- PostgreSQL database on port 5432
- Redis cache on port 6379

### 4. Run Locally (Development)

```bash
# Make sure PostgreSQL is running
python main.py
```

Backend will be available at: http://localhost:8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Multi-Agent Analysis
- `POST /api/multi-agent-analysis` - Analyze financial documents with 6 AI agents

### Report Generation
- `POST /api/reports/generate` - Generate 7 types of reports

### Portfolio Management
- `GET /api/portfolio` - Get user portfolio
- `GET /api/portfolio/holdings` - Get holdings with live prices

### Organizations
- `GET /api/organizations` - List user organizations
- `GET /api/organization-members` - List organization members

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `DELETE /api/webhooks` - Delete webhook

### Feature Flags
- `GET /api/feature-flags` - List feature flags
- `POST /api/feature-flags` - Create/update flag
- `DELETE /api/feature-flags` - Delete flag

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts/acknowledge` - Acknowledge alert
- `POST /api/alerts/resolve` - Resolve alert

### AI Usage Tracking
- `GET /api/ai/usage` - Get usage statistics
- `GET /api/ai-agent-logs` - Get operation logs

### Demo Setup
- `POST /api/demo-setup` - Create demo organization
- `GET /api/demo-setup` - Check demo status

## Database Models

- **Organizations** - Multi-tenant organization management
- **Documents** - Financial document storage and analysis results
- **Alerts** - System alerts and notifications
- **Webhooks** - Event-driven webhook integrations
- **FeatureFlags** - A/B testing and feature toggles
- **AIUsage** - AI usage tracking and limits
- **APIKeys** - API key management
- **Portfolio** - Portfolio and holdings management
- **FinancialMetrics** - Company financial metrics

## Environment Variables

See `.env.example` for all configuration options.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `SECRET_KEY` - JWT secret key (min 32 characters)

Optional:
- `ALPHA_VANTAGE_API_KEY` - Stock data API
- `PINECONE_API_KEY` - Vector database
- `SENTRY_DSN` - Error tracking
- `REDIS_URL` - Cache connection string
- `RESEND_API_KEY` - Email service

## Development

### Run Tests

```bash
pytest
```

### Run with Auto-reload

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head
```

## Production Deployment

### Using Docker

```bash
docker build -t finsight-backend .
docker run -p 8000:8000 --env-file .env finsight-backend
```

### Using Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── config/                 # Configuration and settings
│   ├── settings.py
│   └── database.py
├── models/                 # SQLAlchemy database models
│   ├── organization.py
│   ├── document.py
│   ├── alert.py
│   └── ...
├── api/                    # FastAPI route handlers
│   ├── multi_agent.py
│   ├── reports.py
│   ├── portfolio.py
│   └── ...
├── services/               # Business logic services
│   ├── multi_agent_orchestrator.py
│   ├── report_generator.py
│   └── webhook_service.py
└── utils/                  # Utility functions
    ├── auth.py
    └── logger.py
```

## Multi-Agent AI System

The system uses 6 specialized AI agents:

1. **Parser Agent** - Extracts structured data from documents
2. **Analyzer Agent** - Calculates financial KPIs and ratios
3. **Compliance Agent** - Validates regulatory compliance
4. **Fraud Agent** - Detects financial irregularities
5. **Alert Agent** - Generates actionable alerts
6. **Insight Agent** - Creates plain-language summaries

All agents run in parallel for maximum performance.

## Report Types

1. **Investor Memo** - Professional investor presentations
2. **Audit Summary** - Government-compliant audit reports
3. **Board Deck** - Executive board presentations
4. **Compliance Report** - IFRS/GAAP/SOX compliance
5. **Risk Report** - Monte Carlo simulations and VaR analysis
6. **Tax Filing** - IRS/government tax documents
7. **SEC Filing** - 10-K/10-Q filings

## Support

For issues or questions, create a support ticket through the API:
- Endpoint: `/api/support` (to be implemented)

## License

Proprietary - FinSight AI Financial Guardian System

---

**Version**: 2.0.0
**Last Updated**: November 15, 2025
