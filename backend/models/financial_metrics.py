"""
Financial Metrics Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from config.database import Base


class FinancialMetrics(Base):
    __tablename__ = "financial_metrics"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    fiscal_year = Column(Integer, nullable=False, index=True)
    revenue = Column(Float, nullable=True)
    profit = Column(Float, nullable=True)
    assets = Column(Float, nullable=True)
    liabilities = Column(Float, nullable=True)
    equity = Column(Float, nullable=True)
    cash_flow = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)  # Return on Equity
    roi = Column(Float, nullable=True)  # Return on Investment
    debt_to_equity = Column(Float, nullable=True)
    current_ratio = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
