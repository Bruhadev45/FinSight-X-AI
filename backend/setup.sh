#!/bin/bash

echo "========================================="
echo "FinSight AI - Python Backend Setup"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

echo "✅ Python $(python3 --version) found"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - DATABASE_URL"
    echo "   - SECRET_KEY"
    echo ""
    read -p "Press enter to continue after editing .env..."
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "========================================="
echo "✅ Setup complete!"
echo "========================================="
echo ""
echo "To start the backend:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run server: python main.py"
echo "  Or use Docker: docker-compose up -d"
echo ""
echo "API Documentation: http://localhost:8000/api/docs"
echo "========================================="
