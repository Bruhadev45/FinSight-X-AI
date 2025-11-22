CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agent_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_name" text NOT NULL,
	"document_id" integer,
	"task_type" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"processing_time_ms" integer,
	"result_summary" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"rule_name" text NOT NULL,
	"metric_type" text NOT NULL,
	"threshold_value" real NOT NULL,
	"comparison_operator" text NOT NULL,
	"notification_channels" jsonb,
	"enabled" boolean DEFAULT true,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"company_id" integer,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"source_document_id" integer,
	"status" text DEFAULT 'unread' NOT NULL,
	"triggered_at" text NOT NULL,
	"acknowledged_at" text,
	"resolved_at" text
);
--> statement-breakpoint
CREATE TABLE "benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"peer_company_id" integer NOT NULL,
	"metric_name" text NOT NULL,
	"company_value" real NOT NULL,
	"peer_value" real NOT NULL,
	"variance_percentage" real NOT NULL,
	"period" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"ticker_symbol" text,
	"country" text NOT NULL,
	"last_analyzed" text,
	"total_documents" integer DEFAULT 0,
	"avg_risk_score" real
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"standard_type" text NOT NULL,
	"check_name" text NOT NULL,
	"result" text NOT NULL,
	"details" text,
	"recommendation" text,
	"checked_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"analysis_type" text NOT NULL,
	"key_findings" jsonb,
	"fraud_indicators" jsonb,
	"confidence_score" real,
	"analyzed_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"changes_detected" jsonb,
	"numeric_changes" jsonb,
	"textual_changes" jsonb,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"company_id" integer,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"upload_date" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"risk_level" text,
	"anomaly_count" integer DEFAULT 0,
	"compliance_status" text,
	"summary" text,
	"storage_path" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainable_ai" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer,
	"ai_agent_log_id" integer,
	"alert_id" integer,
	"finding" text NOT NULL,
	"explanation" text NOT NULL,
	"confidence_score" real NOT NULL,
	"citations" jsonb,
	"reasoning_chain" jsonb,
	"model_version" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"fiscal_year" integer NOT NULL,
	"fiscal_quarter" text,
	"revenue" real,
	"ebitda" real,
	"net_income" real,
	"total_assets" real,
	"total_liabilities" real,
	"equity" real,
	"debt_to_equity_ratio" real,
	"roe" real,
	"current_ratio" real,
	"extracted_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecast_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"forecast_type" text NOT NULL,
	"period" text NOT NULL,
	"low_estimate" real NOT NULL,
	"mid_estimate" real NOT NULL,
	"high_estimate" real NOT NULL,
	"confidence" real NOT NULL,
	"methodology" text NOT NULL,
	"forecast_date" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_graph_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"name" text NOT NULL,
	"properties" jsonb,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "knowledge_graph_entities_entity_id_unique" UNIQUE("entity_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_graph_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"relationship_id" text NOT NULL,
	"source_entity_id" text NOT NULL,
	"target_entity_id" text NOT NULL,
	"relationship_type" text NOT NULL,
	"properties" jsonb,
	"created_at" text NOT NULL,
	CONSTRAINT "knowledge_graph_relationships_relationship_id_unique" UNIQUE("relationship_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"channel" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"document_id" integer,
	"alert_id" integer,
	"sent_at" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"report_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_documents" jsonb,
	"citations" jsonb,
	"format" text NOT NULL,
	"generated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"query_text" text NOT NULL,
	"results_count" integer NOT NULL,
	"relevant_documents" jsonb,
	"executed_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'company' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_logs" ADD CONSTRAINT "ai_agent_logs_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_source_document_id_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_analysis" ADD CONSTRAINT "document_analysis_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainable_ai" ADD CONSTRAINT "explainable_ai_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainable_ai" ADD CONSTRAINT "explainable_ai_ai_agent_log_id_ai_agent_logs_id_fk" FOREIGN KEY ("ai_agent_log_id") REFERENCES "public"."ai_agent_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainable_ai" ADD CONSTRAINT "explainable_ai_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_metrics" ADD CONSTRAINT "financial_metrics_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecast_data" ADD CONSTRAINT "forecast_data_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;