# AI Financial Guardian System

A comprehensive AI-powered financial management system with multi-agent analysis, document processing, and real-time monitoring capabilities.

## Features

- **Multi-Agent AI Analysis**: Advanced financial analysis using multiple AI agents
- **Document Processing**: Upload and analyze financial documents with OCR and AI
- **Real-time Monitoring**: Live dashboard with financial metrics and alerts
- **Smart Alerts**: Automated notifications for important financial events
- **RAG System**: Vector-based document search with Pinecone
- **Authentication**: Secure authentication using Better Auth
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.5 (App Router with Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend
- **API**: Next.js API Routes + Python FastAPI
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **AI/ML**:
  - OpenAI GPT-4
  - LangChain for agent orchestration
  - TensorFlow.js for local ML
  - Pinecone for vector storage
- **File Processing**:
  - PDF parsing (pdf-parse, pdf-lib)
  - OCR (Tesseract.js)
- **Notifications**: Twilio (SMS)

### Infrastructure
- **Database**: PostgreSQL
- **Vector DB**: Pinecone
- **Deployment**: Vercel (frontend) + Docker (backend)
- **Testing**: Vitest + React Testing Library

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Python 3.9+ (for backend)
- npm or bun package manager

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
BETTER_AUTH_SECRET=your-secret-key

# Pinecone (Vector Database)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-index-name

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Twilio (SMS Notifications)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# Financial APIs
FMP_API_KEY=your-fmp-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
POLYGON_API_KEY=your-polygon-key
NEWSAPI_KEY=your-newsapi-key
FRED_API_KEY=your-fred-key
```

See `.env.example` for a complete template.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd AI-Financial-Guardian-System-codebase
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Setup PostgreSQL database

```bash
# Create database
createdb finsight_db

# Run migrations
npm run db:push

# (Optional) Seed database
npm run db:seed
```

### 4. Setup Python backend (optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

### Development Mode

**Terminal 1: Start frontend**
```bash
npm run dev
```

**Terminal 2: Start Python backend (if needed)**
```bash
cd backend
source venv/bin/activate
python main.py
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database with sample data

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   └── styles/          # Global styles
├── backend/             # Python FastAPI backend
│   ├── api/            # API endpoints
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   └── utils/          # Utilities
├── public/             # Static assets
├── docs/               # Documentation
├── tests/              # Test files
├── drizzle/            # Database migrations
└── scripts/            # Utility scripts
```

See `docs/PROJECT_STRUCTURE.md` for detailed structure documentation.

## Key Features Documentation

### Document Upload & Analysis
1. Upload financial documents (PDF, images)
2. Automatic OCR processing
3. AI-powered content extraction
4. Vector storage for semantic search
5. Multi-agent analysis pipeline

### Multi-Agent System
- **Risk Analysis Agent**: Evaluates financial risks
- **Compliance Agent**: Checks regulatory compliance
- **Market Analysis Agent**: Analyzes market conditions
- **Recommendation Agent**: Provides actionable insights

### Alert System
- Real-time monitoring of financial metrics
- Configurable alert thresholds
- SMS notifications via Twilio
- Alert history and tracking

## Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Deployment

### Vercel (Frontend)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker (Backend)
```bash
cd backend
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.

## Support

For issues and questions, please open an issue in the GitHub repository.

## Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- OpenAI for GPT-4 API
- LangChain for agent orchestration tools
