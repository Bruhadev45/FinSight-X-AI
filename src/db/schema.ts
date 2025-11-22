import { pgTable, serial, integer, text, real, boolean, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';

// 1. Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadDate: text('upload_date').notNull(),
  status: text('status').notNull().default('processing'),
  riskLevel: text('risk_level'),
  anomalyCount: integer('anomaly_count').default(0),
  complianceStatus: text('compliance_status'),
  summary: text('summary'),
  storagePath: text('storage_path'),
  createdAt: text('created_at').notNull(),
});

// 2. Document Analysis table
export const documentAnalysis = pgTable('document_analysis', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  analysisType: text('analysis_type').notNull(),
  keyFindings: jsonb('key_findings'),
  fraudIndicators: jsonb('fraud_indicators'),
  confidenceScore: real('confidence_score'),
  analyzedAt: text('analyzed_at').notNull(),
});

// 3. Financial Metrics table
export const financialMetrics = pgTable('financial_metrics', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  fiscalYear: integer('fiscal_year').notNull(),
  fiscalQuarter: text('fiscal_quarter'),
  revenue: real('revenue'),
  ebitda: real('ebitda'),
  netIncome: real('net_income'),
  totalAssets: real('total_assets'),
  totalLiabilities: real('total_liabilities'),
  equity: real('equity'),
  debtToEquityRatio: real('debt_to_equity_ratio'),
  roe: real('roe'),
  currentRatio: real('current_ratio'),
  extractedAt: text('extracted_at').notNull(),
});

// 4. Companies table
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  tickerSymbol: text('ticker_symbol'),
  country: text('country').notNull(),
  lastAnalyzed: text('last_analyzed'),
  totalDocuments: integer('total_documents').default(0),
  avgRiskScore: real('avg_risk_score'),
});

// 5. Alerts table
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  alertType: text('alert_type').notNull(),
  severity: text('severity').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  sourceDocumentId: integer('source_document_id').references(() => documents.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('unread'),
  triggeredAt: text('triggered_at').notNull(),
  acknowledgedAt: text('acknowledged_at'),
  resolvedAt: text('resolved_at'),
});

// 6. Alert Rules table
export const alertRules = pgTable('alert_rules', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  ruleName: text('rule_name').notNull(),
  metricType: text('metric_type').notNull(),
  thresholdValue: real('threshold_value').notNull(),
  comparisonOperator: text('comparison_operator').notNull(),
  notificationChannels: jsonb('notification_channels'),
  enabled: boolean('enabled').default(true),
  createdAt: text('created_at').notNull(),
});

// 7. Document Versions table
export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  changesDetected: jsonb('changes_detected'),
  numericChanges: jsonb('numeric_changes'),
  textualChanges: jsonb('textual_changes'),
  createdAt: text('created_at').notNull(),
});

// 8. Reports table
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  reportType: text('report_type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  sourceDocuments: jsonb('source_documents'),
  citations: jsonb('citations'),
  format: text('format').notNull(),
  generatedAt: text('generated_at').notNull(),
});

// 9. Search Queries table
export const searchQueries = pgTable('search_queries', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  queryText: text('query_text').notNull(),
  resultsCount: integer('results_count').notNull(),
  relevantDocuments: jsonb('relevant_documents'),
  executedAt: text('executed_at').notNull(),
});

// 10. Compliance Checks table
export const complianceChecks = pgTable('compliance_checks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  standardType: text('standard_type').notNull(),
  checkName: text('check_name').notNull(),
  result: text('result').notNull(),
  details: text('details'),
  recommendation: text('recommendation'),
  checkedAt: text('checked_at').notNull(),
});

// 11. AI Agent Logs table
export const aiAgentLogs = pgTable('ai_agent_logs', {
  id: serial('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  taskType: text('task_type').notNull(),
  status: text('status').notNull().default('running'),
  processingTimeMs: integer('processing_time_ms'),
  resultSummary: text('result_summary'),
  createdAt: text('created_at').notNull(),
});

// 12. Benchmarks table
export const benchmarks = pgTable('benchmarks', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  peerCompanyId: integer('peer_company_id').notNull(),
  metricName: text('metric_name').notNull(),
  companyValue: real('company_value').notNull(),
  peerValue: real('peer_value').notNull(),
  variancePercentage: real('variance_percentage').notNull(),
  period: text('period').notNull(),
  createdAt: text('created_at').notNull(),
});

// 13. Knowledge Graph Entities table
export const knowledgeGraphEntities = pgTable('knowledge_graph_entities', {
  id: serial('id').primaryKey(),
  entityId: text('entity_id').notNull().unique(),
  entityType: text('entity_type').notNull(),
  name: text('name').notNull(),
  properties: jsonb('properties'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 14. Knowledge Graph Relationships table
export const knowledgeGraphRelationships = pgTable('knowledge_graph_relationships', {
  id: serial('id').primaryKey(),
  relationshipId: text('relationship_id').notNull().unique(),
  sourceEntityId: text('source_entity_id').notNull(),
  targetEntityId: text('target_entity_id').notNull(),
  relationshipType: text('relationship_type').notNull(),
  properties: jsonb('properties'),
  createdAt: text('created_at').notNull(),
});

// 15. Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  channel: text('channel').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  alertId: integer('alert_id').references(() => alerts.id, { onDelete: 'cascade' }),
  sentAt: text('sent_at'),
  createdAt: text('created_at').notNull(),
});

// 16. Forecast Data table
export const forecastData = pgTable('forecast_data', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  forecastType: text('forecast_type').notNull(),
  period: text('period').notNull(),
  lowEstimate: real('low_estimate').notNull(),
  midEstimate: real('mid_estimate').notNull(),
  highEstimate: real('high_estimate').notNull(),
  confidence: real('confidence').notNull(),
  methodology: text('methodology').notNull(),
  forecastDate: text('forecast_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// 17. Explainable AI table
export const explainableAI = pgTable('explainable_ai', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  aiAgentLogId: integer('ai_agent_log_id').references(() => aiAgentLogs.id, { onDelete: 'cascade' }),
  alertId: integer('alert_id').references(() => alerts.id, { onDelete: 'cascade' }),
  finding: text('finding').notNull(),
  explanation: text('explanation').notNull(),
  confidenceScore: real('confidence_score').notNull(),
  citations: jsonb('citations'),
  reasoningChain: jsonb('reasoning_chain'),
  modelVersion: text('model_version').notNull(),
  createdAt: text('created_at').notNull(),
});


// 18. Portfolio tables
export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  totalValue: real('total_value').default(0),
  totalCost: real('total_cost').default(0),
  totalGainLoss: real('total_gain_loss').default(0),
  totalGainLossPercent: real('total_gain_loss_percent').default(0),
  isDefault: boolean('is_default').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const portfolioHoldings = pgTable('portfolio_holdings', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  companyName: text('company_name').notNull(),
  shares: real('shares').notNull(),
  avgCostPerShare: real('avg_cost_per_share').notNull(),
  totalCost: real('total_cost').notNull(),
  currentPrice: real('current_price'),
  currentValue: real('current_value'),
  gainLoss: real('gain_loss'),
  gainLossPercent: real('gain_loss_percent'),
  lastUpdated: text('last_updated'),
  createdAt: text('created_at').notNull(),
});

export const portfolioTransactions = pgTable('portfolio_transactions', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  holdingId: integer('holding_id').references(() => portfolioHoldings.id, { onDelete: 'set null' }),
  symbol: text('symbol').notNull(),
  transactionType: text('transaction_type').notNull(), // 'buy' or 'sell'
  shares: real('shares').notNull(),
  pricePerShare: real('price_per_share').notNull(),
  totalAmount: real('total_amount').notNull(),
  fees: real('fees').default(0),
  notes: text('notes'),
  transactionDate: text('transaction_date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  companyName: text('company_name').notNull(),
  addedPrice: real('added_price'),
  targetPrice: real('target_price'),
  notes: text('notes'),
  alertEnabled: boolean('alert_enabled').default(false),
  createdAt: text('created_at').notNull(),
});

// Auth tables for better-auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),
  image: text("image"),
  role: text("role")
    .notNull()
    .default("company"),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// ENTERPRISE FEATURES - Multi-tenancy & B2B
// ==========================================

// Organizations (Workspaces) - Multi-tenancy
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('individual'), // individual, professional, business, enterprise
  status: text('status').notNull().default('active'), // active, suspended, canceled
  billingEmail: text('billing_email'),
  maxUsers: integer('max_users').default(1),
  maxDocuments: integer('max_documents').default(10),
  currentDocumentCount: integer('current_document_count').default(0),
  settings: jsonb('settings').default('{}'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Organization Members - User roles & permissions
export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, member, viewer
  permissions: jsonb('permissions').default('{}'),
  invitedBy: text('invited_by'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Team Invitations
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  invitedBy: text('invited_by').notNull(),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'), // pending, accepted, expired
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Subscriptions - Billing & Plans
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  plan: text('plan').notNull(), // individual, professional, business, enterprise
  status: text('status').notNull(), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAt: timestamp('cancel_at'),
  canceledAt: timestamp('canceled_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Usage Tracking - Monitor limits
export const usageTracking = pgTable('usage_tracking', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // YYYY-MM format
  documentsUploaded: integer('documents_uploaded').default(0),
  documentsAnalyzed: integer('documents_analyzed').default(0),
  apiCallsMade: integer('api_calls_made').default(0),
  storageUsedMb: real('storage_used_mb').default(0),
  aiCreditsUsed: integer('ai_credits_used').default(0),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// API Keys - For developer access
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(), // First 8 chars for display
  permissions: jsonb('permissions').default('{}'),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Audit Logs - Enhanced for compliance
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  action: text('action').notNull(), // user.created, document.uploaded, etc.
  resourceType: text('resource_type').notNull(), // user, document, organization, etc.
  resourceId: text('resource_id'),
  changes: jsonb('changes').default('{}'),
  metadata: jsonb('metadata').default('{}'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// SSO Connections - Enterprise SSO
export const ssoConnections = pgTable('sso_connections', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // saml, google, microsoft, okta
  enabled: boolean('enabled').default(true),
  config: jsonb('config').notNull(),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Webhooks - For integrations
export const webhooks = pgTable('webhooks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: jsonb('events').notNull(), // Array of event types to subscribe to
  secret: text('secret').notNull(),
  enabled: boolean('enabled').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  failureCount: integer('failure_count').default(0),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Webhook Deliveries - Track webhook calls
export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: serial('id').primaryKey(),
  webhookId: integer('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  error: text('error'),
  attemptCount: integer('attempt_count').default(1),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Feature Flags - A/B testing & gradual rollout
export const featureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').default(false),
  rolloutPercentage: integer('rollout_percentage').default(0), // 0-100
  rules: jsonb('rules').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Support Tickets - Customer support system
export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('open'), // open, in_progress, waiting, resolved, closed
  priority: text('priority').notNull().default('normal'), // low, normal, high, urgent
  category: text('category'), // technical, billing, feature_request, bug
  assignedTo: text('assigned_to'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// Support Ticket Messages
export const ticketMessages = pgTable('ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false),
  attachments: jsonb('attachments').default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});