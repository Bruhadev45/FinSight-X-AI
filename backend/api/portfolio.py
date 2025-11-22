"""
Portfolio Management API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import httpx
from datetime import datetime

from config.database import get_db
from config.settings import settings
from models.portfolio import Portfolio, PortfolioHolding

logger = logging.getLogger(__name__)

router = APIRouter()


class PortfolioResponse(BaseModel):
    id: int
    user_id: str
    name: str
    total_value: float
    total_gain_loss: float

    class Config:
        from_attributes = True


class HoldingResponse(BaseModel):
    id: int
    symbol: str
    company_name: Optional[str]
    quantity: float
    purchase_price: float
    current_price: Optional[float]
    total_value: Optional[float]
    gain_loss: Optional[float]
    gain_loss_percent: Optional[float]

    class Config:
        from_attributes = True


@router.get("/portfolio")
async def get_portfolio(
    user_id: str = Query(default="demo-user"),
    db: Session = Depends(get_db)
):
    """Get user's portfolio"""
    try:
        portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

        if not portfolio:
            # Create demo portfolio if not exists
            portfolio = Portfolio(
                user_id=user_id,
                name="My Portfolio",
                total_value=0.0,
                total_gain_loss=0.0
            )
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)

        return {
            "success": True,
            "portfolio": PortfolioResponse.from_orm(portfolio),
        }

    except Exception as e:
        logger.error(f"Failed to get portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio/holdings")
async def get_holdings(
    portfolio_id: int = Query(default=1),
    db: Session = Depends(get_db)
):
    """Get portfolio holdings with real-time prices"""
    try:
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()

        # Update prices if Alpha Vantage API key is available
        if settings.ALPHA_VANTAGE_API_KEY:
            for holding in holdings:
                try:
                    price = await get_stock_price(holding.symbol)
                    if price:
                        holding.current_price = price
                        holding.total_value = price * holding.quantity
                        holding.gain_loss = holding.total_value - (holding.purchase_price * holding.quantity)
                        holding.gain_loss_percent = (holding.gain_loss / (holding.purchase_price * holding.quantity)) * 100
                except Exception as e:
                    logger.warning(f"Failed to update price for {holding.symbol}: {str(e)}")

            db.commit()

        return {
            "success": True,
            "holdings": [HoldingResponse.from_orm(h) for h in holdings],
        }

    except Exception as e:
        logger.error(f"Failed to get holdings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_stock_price(symbol: str) -> Optional[float]:
    """Get current stock price from Alpha Vantage"""
    if not settings.ALPHA_VANTAGE_API_KEY:
        return None

    try:
        async with httpx.AsyncClient() as client:
            url = f"https://www.alphavantage.co/query"
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": settings.ALPHA_VANTAGE_API_KEY
            }
            response = await client.get(url, params=params, timeout=10.0)
            data = response.json()

            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                return float(data["Global Quote"]["05. price"])

    except Exception as e:
        logger.error(f"Failed to fetch stock price for {symbol}: {str(e)}")

    return None
