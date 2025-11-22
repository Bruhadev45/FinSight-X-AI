// Enterprise AI Feature Types

export type NotificationChannel = 'push' | 'sms' | 'email' | 'slack';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type AgentType = 'parser' | 'analyzer' | 'compliance' | 'fraud' | 'alert' | 'insight' | 'orchestrator';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Document Intelligence
export interface DocumentEntity {
  type: 'CURRENCY_VALUE' | 'PERCENTAGE' | 'DATE' | 'COMPANY_NAME' | 'ACCOUNT_NUMBER' | 'RATIO';
  value: string;
  confidence: number;
  source: string;
  pageNumber?: number;
}

export interface DocumentStructure {
  tables: TableStructure[];
  sections: DocumentSection[];
  entities: DocumentEntity[];
  metadata: DocumentMetadata;
}

export interface TableStructure {
  id: string;
  headers: string[];
  rows: string[][];
  pageNumber: number;
  confidence: number;
}

export interface DocumentSection {
  title: string;
  content: string;
  pageNumber: number;
  type: 'executive_summary' | 'financial_statement' | 'risk_factors' | 'notes' | 'other';
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  processingTime: string;
  documentType: 'annual_report' | 'quarterly_report' | 'audit_report' | 'credit_agreement' | 'other';
  fiscalYear?: number;
  fiscalQuarter?: string;
}

// RAG & Semantic Search
export interface VectorSearchResult {
  content: string;
  metadata: {
    companyId: string;
    documentType: string;
    fiscalYear: number;
    source: string;
    pageNumber?: number;
  };
  score: number;
}

export interface SemanticQueryResult {
  answer: string;
  sources: VectorSearchResult[];
  confidence: ConfidenceLevel;
  reasoning: string[];
}

// Time-Series Forecasting
export interface ForecastResult {
  predictions: number[];
  confidenceIntervals: {
    lower: number[];
    upper: number[];
  };
  metadata: {
    model: 'LSTM' | 'Prophet' | 'ARIMA';
    horizon: number;
    trainedOn: number;
    mse: number;
    mae: number;
  };
}

export interface AnomalyDetection {
  anomalies: Array<{
    index: number;
    value: number;
    score: number;
    timestamp: Date;
    reason: string;
  }>;
  method: 'statistical' | 'isolation_forest' | 'autoencoder';
}

export interface MonteCarloResult {
  simulations: number;
  paths: number[][];
  statistics: {
    mean: number;
    std: number;
    percentile5: number;
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile95: number;
    valueAtRisk: number;
    expectedShortfall: number;
  };
}

// Multi-Agent System
export interface AgentTask {
  id: string;
  type: AgentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  input: any;
  output?: any;
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
}

export interface AgentResponse {
  agentType: AgentType;
  findings: any[];
  confidence: number;
  processingTime: number;
  metadata?: any;
}

export interface OrchestratorResult {
  taskId: string;
  agentResults: AgentResponse[];
  overallRisk: RiskLevel;
  keyFindings: string[];
  recommendations: string[];
  executionTime: number;
}

// Notifications
export interface NotificationPayload {
  userId: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, string>;
  urgency?: 'low' | 'normal' | 'high';
  metadata?: {
    alertType?: string;
    companyId?: string;
    priority?: number;
  };
}

export interface NotificationRecord {
  id: string;
  userId: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  status: NotificationStatus;
  deliveryAttempts: number;
  lastAttemptAt: Date;
  sentAt?: Date;
  failureReason?: string;
  externalIds: {
    fcmMessageId?: string;
    twilioMessageSid?: string;
    resendEmailId?: string;
    slackMessageTs?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Explainable AI
export interface Citation {
  source: string;
  documentId: string;
  pageNumber: number;
  paragraph: string;
  relevanceScore: number;
}

export interface ExplanationChain {
  step: number;
  reasoning: string;
  evidence: Citation[];
  confidence: number;
}

export interface ExplainableResult {
  conclusion: string;
  confidence: ConfidenceLevel;
  citations: Citation[];
  reasoningChain: ExplanationChain[];
  modelVersion: string;
  timestamp: Date;
}

// Human-in-the-Loop
export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  type: 'comment' | 'correction' | 'flag' | 'approval';
  content: string;
  position: {
    pageNumber: number;
    x: number;
    y: number;
  };
  status: 'pending' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ApprovalQueue {
  id: string;
  findingId: string;
  type: 'fraud_detection' | 'compliance_issue' | 'risk_alert';
  description: string;
  aiConfidence: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}

// Report Generation
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'investor_memo' | 'audit_summary' | 'risk_report' | 'compliance_report' | 'board_deck';
  sections: ReportSection[];
  format: 'pdf' | 'docx' | 'pptx' | 'html';
}

export interface ReportSection {
  title: string;
  type: 'executive_summary' | 'data_table' | 'chart' | 'narrative' | 'recommendations';
  content?: string;
  dataSource?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'scatter';
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  companyId: string;
  period: string;
  format: 'pdf' | 'docx' | 'pptx' | 'html';
  content: string | Buffer;
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    dataSourcesUsed: string[];
    pageCount: number;
  };
}

// Governance & Compliance
export interface AuditTrail {
  id: string;
  action: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface DataLineage {
  dataId: string;
  sourceType: 'upload' | 'api' | 'calculation' | 'model_prediction';
  source: string;
  transformations: Array<{
    step: number;
    operation: string;
    timestamp: Date;
  }>;
  downstream: string[];
}

export interface BiasMetric {
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  explanation: string;
}
