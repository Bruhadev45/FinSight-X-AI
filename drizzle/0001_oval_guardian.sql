CREATE TABLE "portfolio_holdings" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"shares" real NOT NULL,
	"avg_cost_per_share" real NOT NULL,
	"total_cost" real NOT NULL,
	"current_price" real,
	"current_value" real,
	"gain_loss" real,
	"gain_loss_percent" real,
	"last_updated" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"holding_id" integer,
	"symbol" text NOT NULL,
	"transaction_type" text NOT NULL,
	"shares" real NOT NULL,
	"price_per_share" real NOT NULL,
	"total_amount" real NOT NULL,
	"fees" real DEFAULT 0,
	"notes" text,
	"transaction_date" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_value" real DEFAULT 0,
	"total_cost" real DEFAULT 0,
	"total_gain_loss" real DEFAULT 0,
	"total_gain_loss_percent" real DEFAULT 0,
	"is_default" boolean DEFAULT false,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"added_price" real,
	"target_price" real,
	"notes" text,
	"alert_enabled" boolean DEFAULT false,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_holding_id_portfolio_holdings_id_fk" FOREIGN KEY ("holding_id") REFERENCES "public"."portfolio_holdings"("id") ON DELETE set null ON UPDATE no action;