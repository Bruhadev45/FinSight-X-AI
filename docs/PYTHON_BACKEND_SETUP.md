# Python Backend Setup Guide

## Overview

The entire backend has been migrated to Python with FastAPI! This provides better performance, easier ML integration, and cleaner architecture.

## What's New

### Complete Python Backend
- ✅ FastAPI REST API (modern, fast, async)
- ✅ SQLAlchemy ORM with PostgreSQL
- ✅ All 6 AI agents migrated to Python
- ✅ Report generation system in Python
- ✅ Webhook system with HMAC signatures
- ✅ Authentication & authorization middleware
- ✅ Docker & Docker Compose support
- ✅ Complete API documentation (Swagger/ReDoc)

### Features

1. **Multi-Agent AI System** - 6 specialized agents running in parallel
2. **Report Generator** - 7 types of government-compliant reports
3. **Portfolio Tracker** - Real-time stock prices via Alpha Vantage
4. **Webhooks** - Event-driven integrations with HMAC signing
5. **Feature Flags** - A/B testing and gradual rollouts
6. **Usage Tracking** - Plan-based limits and monitoring
7. **Alerts** - Real-time notification system

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your API keys
# Required: OPENAI_API_KEY, DATABASE_URL, SECRET_KEY

# 4. Start all services
docker-compose up -d

# 5. View logs
docker-compose logs -f

# 6. Stop services
docker-compose down
```

Backend will be running at: **http://localhost:8000**
Swagger API docs: **http://localhost:8000/api/docs**

### Option 2: Local Development

```bash
# 1. Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env
# Edit .env with your settings

# 4. Make sure PostgreSQL is running
# Default: postgresql://postgres:password@localhost:5432/finsight

# 5. Run the server
python main.py

# Or with auto-reload:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finsight

# OpenAI (for AI agents)
OPENAI_API_KEY=sk-...

# Security (generate a random 32+ character string)
SECRET_KEY=your-super-secret-key-min-32-chars
```

### Optional

```env
# Stock Data
ALPHA_VANTAGE_API_KEY=your_key

# Error Tracking
SENTRY_DSN=your_sentry_dsn

# Cache
REDIS_URL=redis://localhost:6379

# Email
RESEND_API_KEY=your_key
```

## Database Setup

The backend automatically creates tables on startup. For manual migration:

```bash
# Install Alembic
pip install alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

## API Endpoints

### Core Features

```
POST /api/multi-agent-analysis   # Analyze documents with 6 AI agents
POST /api/reports/generate        # Generate 7 types of reports
GET  /api/portfolio               # Get portfolio data
GET  /api/portfolio/holdings      # Get holdings with live prices
```

### Management

```
GET  /api/organizations           # List organizations
GET  /api/webhooks                # List webhooks
POST /api/webhooks                # Create webhook
GET  /api/feature-flags           # Get feature flags
GET  /api/alerts                  # List alerts
POST /api/alerts/acknowledge      # Acknowledge alert
GET  /api/ai/usage                # Get AI usage stats
```

### Demo

```
POST /api/demo-setup              # Create demo organization
GET  /api/demo-setup              # Check demo status
```

## Testing the Backend

### 1. Health Check

```bash
curl http://localhost:8000/health
```

### 2. Test Multi-Agent Analysis

```bash
curl -X POST http://localhost:8000/api/multi-agent-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "financial-report.pdf",
    "fileContent": "Revenue increased by 25% to $10M...",
    "organizationId": 1
  }'
```

### 3. Generate Report

```bash
curl -X POST http://localhost:8000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "investor_memo",
    "data": {
      "companyData": {"name": "TechCorp"},
      "financialData": {"revenue": 10000000}
    }
  }'
```

### 4. View API Documentation

Visit: http://localhost:8000/api/docs

## Frontend Integration

### Update .env in root directory

```env
# Add to your main .env file
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Keep existing Next.js API routes for now
# They can proxy to Python backend
```

### Frontend API Calls

The frontend will need to be updated to call the Python backend instead of Next.js API routes. Example:

```typescript
// Old (Next.js API)
const response = await fetch('/api/multi-agent-analysis', {...});

// New (Python FastAPI)
const response = await fetch('http://localhost:8000/api/multi-agent-analysis', {...});

// Or use environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const response = await fetch(`${API_URL}/multi-agent-analysis`, {...});
```

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│   Next.js       │      │  Python FastAPI  │      │   PostgreSQL   │
│   Frontend      │─────▶│     Backend      │─────▶│    Database    │
│  (Port 3004)    │      │   (Port 8000)    │      │   (Port 5432)  │
└─────────────────┘      └──────────────────┘      └────────────────┘
                                 │
                                 │
                                 ▼
                         ┌──────────────┐
                         │    Redis     │
                         │    Cache     │
                         │ (Port 6379)  │
                         └──────────────┘
```

## Advantages of Python Backend

1. **Better AI/ML Integration**
   - Native TensorFlow/PyTorch support
   - Easier scikit-learn integration
   - Better NumPy/Pandas support

2. **Performance**
   - Async/await with FastAPI
   - Better concurrent request handling
   - Efficient database operations

3. **Developer Experience**
   - Clear separation of concerns
   - Type hints with Pydantic
   - Auto-generated API documentation

4. **Scalability**
   - Easy to containerize and deploy
   - Horizontal scaling with load balancer
   - Microservices-ready architecture

## Production Deployment

### Docker Production Build

```bash
# Build production image
docker build -t finsight-backend:prod .

# Run in production
docker run -d \
  -p 8000:8000 \
  --env-file .env.production \
  --name finsight-backend \
  finsight-backend:prod
```

### Deploy to Cloud

#### AWS ECS / Fargate
- Push Docker image to ECR
- Create ECS task definition
- Deploy to Fargate cluster

#### Google Cloud Run
```bash
gcloud run deploy finsight-backend \
  --source . \
  --platform managed \
  --region us-central1
```

#### Azure Container Instances
```bash
az container create \
  --resource-group finsight \
  --name finsight-backend \
  --image finsight-backend:prod \
  --cpu 2 --memory 4
```

## Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/api/demo-setup
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend

# Local logs
tail -f logs/app.log
```

### Sentry Integration

The backend supports Sentry for error tracking. Set `SENTRY_DSN` in your `.env` file.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection
psql -h localhost -U postgres -d finsight
```

### Port Already in Use

```bash
# Find process on port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Import Errors

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## Next Steps

1. ✅ **Backend is Ready** - All endpoints are functional
2. 🔄 **Update Frontend** - Point API calls to Python backend
3. 🧪 **Test Integration** - Verify all features work end-to-end
4. 🚀 **Deploy** - Use Docker Compose or cloud platform

## Support

For issues or questions:
1. Check API docs at http://localhost:8000/api/docs
2. Review backend logs
3. Test endpoints with curl or Postman

---

**Python Backend Version**: 2.0.0
**Last Updated**: November 15, 2025
