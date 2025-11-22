// Advanced AI Engine for Document Processing
export interface AIAnalysisResult {
  confidence: number;
  insights: string[];
  entities: Entity[];
  sentimentScore: number;
  riskScore: number;
  anomalies: Anomaly[];
  recommendations: string[];
}

export interface Entity {
  type: 'company' | 'person' | 'amount' | 'date' | 'location' | 'account';
  value: string;
  confidence: number;
  context: string;
}

export interface Anomaly {
  type: 'duplicate' | 'unusual_amount' | 'frequency' | 'pattern' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFields: string[];
  suggestedAction: string;
}

export class AIEngine {
  /**
   * Advanced text analysis using pattern matching and NLP techniques
   */
  static analyzeText(text: string): AIAnalysisResult {
    const entities = this.extractEntities(text);
    const sentimentScore = this.analyzeSentiment(text);
    const riskScore = this.calculateRiskScore(text, entities);
    const anomalies = this.detectAnomalies(text, entities);
    const insights = this.generateInsights(text, entities, anomalies);
    const recommendations = this.generateRecommendations(riskScore, anomalies);

    return {
      confidence: this.calculateConfidence(entities, anomalies),
      insights,
      entities,
      sentimentScore,
      riskScore,
      anomalies,
      recommendations,
    };
  }

  /**
   * Extract named entities from text using regex patterns
   */
  private static extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    // Extract monetary amounts
    const amountRegex = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/g;
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      entities.push({
        type: 'amount',
        value: match[0],
        confidence: 0.95,
        context: this.getContext(text, match.index, 30),
      });
    }

    // Extract dates
    const dateRegex = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/gi;
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.9,
        context: this.getContext(text, match.index, 30),
      });
    }

    // Extract company names (uppercase words, Inc, Corp, LLC, etc.)
    const companyRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd|Co|Corporation|Company|Group)\.?))\b/g;
    while ((match = companyRegex.exec(text)) !== null) {
      entities.push({
        type: 'company',
        value: match[1],
        confidence: 0.85,
        context: this.getContext(text, match.index, 30),
      });
    }

    // Extract person names (capitalized words in sequence)
    const personRegex = /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
    while ((match = personRegex.exec(text)) !== null) {
      // Skip if it's a company
      if (!entities.some(e => e.type === 'company' && e.value === match[1])) {
        entities.push({
          type: 'person',
          value: match[1],
          confidence: 0.75,
          context: this.getContext(text, match.index, 30),
        });
      }
    }

    // Extract account numbers
    const accountRegex = /\b(?:Account|Acct)[\s#:]*(\d{4,16})\b/gi;
    while ((match = accountRegex.exec(text)) !== null) {
      entities.push({
        type: 'account',
        value: match[1],
        confidence: 0.9,
        context: this.getContext(text, match.index, 30),
      });
    }

    return entities;
  }

  /**
   * Analyze sentiment of text (positive/negative financial indicators)
   */
  private static analyzeSentiment(text: string): number {
    const positiveWords = [
      'profit', 'revenue', 'growth', 'increase', 'gain', 'success', 'positive',
      'improved', 'strong', 'excellent', 'outstanding', 'exceed', 'surplus'
    ];
    const negativeWords = [
      'loss', 'decline', 'decrease', 'deficit', 'fraud', 'risk', 'negative',
      'weak', 'poor', 'below', 'concern', 'warning', 'alert', 'suspicious'
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length * 0.1;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score -= matches.length * 0.1;
    });

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Calculate risk score based on content analysis
   */
  private static calculateRiskScore(text: string, entities: Entity[]): number {
    let risk = 0;

    // High amounts increase risk
    const amounts = entities.filter(e => e.type === 'amount');
    amounts.forEach(amount => {
      const value = parseFloat(amount.value.replace(/[$,]/g, ''));
      if (value > 100000) risk += 0.2;
      if (value > 1000000) risk += 0.3;
    });

    // Risk keywords
    const riskKeywords = [
      'fraud', 'suspicious', 'unusual', 'unauthorized', 'discrepancy',
      'alert', 'warning', 'violation', 'breach', 'anomaly'
    ];
    const lowerText = text.toLowerCase();
    riskKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) risk += 0.15;
    });

    // Multiple high-value transactions
    if (amounts.length > 5) risk += 0.1;

    return Math.min(1, risk);
  }

  /**
   * Detect anomalies in the data
   */
  private static detectAnomalies(text: string, entities: Entity[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for duplicate entries
    const entityValues = entities.map(e => e.value);
    const duplicates = entityValues.filter((item, index) => entityValues.indexOf(item) !== index);
    if (duplicates.length > 0) {
      anomalies.push({
        type: 'duplicate',
        severity: 'medium',
        description: `Found ${duplicates.length} duplicate entries`,
        affectedFields: Array.from(new Set(duplicates)),
        suggestedAction: 'Review and remove duplicate entries',
      });
    }

    // Check for unusual amounts
    const amounts = entities.filter(e => e.type === 'amount');
    if (amounts.length > 0) {
      const values = amounts.map(a => parseFloat(a.value.replace(/[$,]/g, '')));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / values.length);

      values.forEach((value, index) => {
        if (Math.abs(value - avg) > 2 * stdDev) {
          anomalies.push({
            type: 'unusual_amount',
            severity: value > avg ? 'high' : 'medium',
            description: `Amount ${amounts[index].value} is significantly different from average`,
            affectedFields: [amounts[index].value],
            suggestedAction: 'Verify the transaction amount',
          });
        }
      });
    }

    // Check for data quality issues
    if (text.includes('N/A') || text.includes('null') || text.includes('undefined')) {
      anomalies.push({
        type: 'data_quality',
        severity: 'low',
        description: 'Missing or incomplete data fields detected',
        affectedFields: ['various'],
        suggestedAction: 'Fill in missing information',
      });
    }

    return anomalies;
  }

  /**
   * Generate actionable insights
   */
  private static generateInsights(text: string, entities: Entity[], anomalies: Anomaly[]): string[] {
    const insights: string[] = [];

    // Entity-based insights
    const companies = entities.filter(e => e.type === 'company');
    const amounts = entities.filter(e => e.type === 'amount');
    const dates = entities.filter(e => e.type === 'date');

    if (companies.length > 0) {
      insights.push(`Identified ${companies.length} company reference(s): ${companies.slice(0, 3).map(c => c.value).join(', ')}`);
    }

    if (amounts.length > 0) {
      const total = amounts.reduce((sum, a) => {
        return sum + parseFloat(a.value.replace(/[$,]/g, ''));
      }, 0);
      insights.push(`Total monetary value: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }

    if (dates.length > 0) {
      insights.push(`Document contains ${dates.length} date reference(s)`);
    }

    // Anomaly-based insights
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
    if (criticalAnomalies.length > 0) {
      insights.push(`⚠️ ${criticalAnomalies.length} critical issue(s) require immediate attention`);
    }

    return insights;
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(riskScore: number, anomalies: Anomaly[]): string[] {
    const recommendations: string[] = [];

    if (riskScore > 0.7) {
      recommendations.push('🔴 High risk detected - Immediate review required');
      recommendations.push('Schedule audit with compliance team');
    } else if (riskScore > 0.4) {
      recommendations.push('🟡 Medium risk - Enhanced monitoring recommended');
    } else {
      recommendations.push('🟢 Low risk - Standard processing applicable');
    }

    // Anomaly-specific recommendations
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      recommendations.push('Address critical anomalies before processing');
    }

    const duplicates = anomalies.filter(a => a.type === 'duplicate');
    if (duplicates.length > 0) {
      recommendations.push('Implement deduplication process');
    }

    return recommendations;
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateConfidence(entities: Entity[], anomalies: Anomaly[]): number {
    let confidence = 0.5; // Base confidence

    // More entities = higher confidence
    confidence += Math.min(0.3, entities.length * 0.03);

    // High-confidence entities boost overall confidence
    const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / (entities.length || 1);
    confidence += avgEntityConfidence * 0.2;

    // Anomalies reduce confidence
    confidence -= anomalies.length * 0.05;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get surrounding context for an entity
   */
  private static getContext(text: string, index: number, radius: number): string {
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + radius);
    return '...' + text.substring(start, end) + '...';
  }

  /**
   * Compare two documents and find differences
   */
  static compareDocuments(doc1Text: string, doc2Text: string) {
    const entities1 = this.extractEntities(doc1Text);
    const entities2 = this.extractEntities(doc2Text);

    const differences = {
      addedEntities: entities2.filter(e2 => !entities1.some(e1 => e1.value === e2.value)),
      removedEntities: entities1.filter(e1 => !entities2.some(e2 => e2.value === e1.value)),
      changedEntities: [] as { from: Entity; to: Entity }[],
      similarity: this.calculateSimilarity(doc1Text, doc2Text),
    };

    return differences;
  }

  /**
   * Calculate text similarity (simple Jaccard index)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Batch analyze multiple documents
   */
  static async batchAnalyze(documents: { id: string; text: string }[]): Promise<Map<string, AIAnalysisResult>> {
    const results = new Map<string, AIAnalysisResult>();

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));

    for (const doc of documents) {
      results.set(doc.id, this.analyzeText(doc.text));
    }

    return results;
  }
}
