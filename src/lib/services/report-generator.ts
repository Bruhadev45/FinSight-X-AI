// Report Generation & Automation
import OpenAI from "openai";
import { GeneratedReport, ReportTemplate } from "@/lib/types/enterprise";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use GPT-4 for better accuracy in financial reports
const REPORT_MODEL = "gpt-4" as const;
const HIGH_ACCURACY_TEMP = 0.1; // Lower temperature for more deterministic, accurate outputs
const MEDIUM_ACCURACY_TEMP = 0.2;
const CREATIVE_TEMP = 0.3;

export class ReportGeneratorService {
  async generateInvestorMemo(
    companyData: {
      name: string;
      financials: any;
      analysis: any;
      risks: string[];
    }
  ): Promise<string> {
    const systemPrompt = `You are a senior financial analyst at a major investment firm with 15+ years of experience.
You create detailed, data-driven investor memos that institutional investors rely on for million-dollar decisions.
Your analysis must be:
- Precise and factual, citing specific numbers from the data
- Professional in tone and formatting
- Comprehensive yet concise
- Include specific financial metrics, ratios, and trends
- Provide clear investment thesis with supporting evidence
- Highlight both opportunities and risks objectively`;

    const userPrompt = `Create a professional investor memo for ${companyData.name}.

FINANCIAL DATA AVAILABLE:
${JSON.stringify(companyData.financials, null, 2)}

ANALYSIS INSIGHTS:
${JSON.stringify(companyData.analysis, null, 2)}

IDENTIFIED RISKS:
${companyData.risks.map((r, i) => `${i + 1}. ${r}`).join("\n")}

REQUIRED SECTIONS:
1. Executive Summary (3-4 key takeaways with specific metrics)
2. Financial Performance Analysis
   - Revenue trends and growth rates
   - Profitability metrics (gross margin, EBITDA, net income)
   - Key financial ratios (ROE, ROA, debt-to-equity, current ratio)
   - Year-over-year and quarter-over-quarter comparisons
3. Operational Highlights
   - Market position and competitive advantages
   - Business model strengths
4. Risk Assessment
   - Financial risks with quantified impact
   - Operational and market risks
   - Mitigation strategies
5. Investment Recommendation
   - Clear BUY/HOLD/SELL recommendation with rationale
   - Target price or valuation range
   - Key catalysts and timeline

FORMAT: Professional markdown document with clear sections, bullet points for key metrics, and tables where appropriate.
TONE: Objective, data-driven, suitable for institutional investors.`;

    const completion = await openai.chat.completions.create({
      model: REPORT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: MEDIUM_ACCURACY_TEMP,
      max_tokens: 2500,
    });

    return completion.choices[0].message.content || "";
  }

  async generateAuditSummary(
    complianceChecks: any[],
    fraudFindings: any[]
  ): Promise<string> {
    const systemPrompt = `You are a certified public accountant (CPA) and audit partner at a Big 4 accounting firm.
You create government-compliant audit reports that meet SOC 2, ISO 27001, and regulatory standards.
Your reports are used by:
- Internal auditors and audit committees
- External regulators (SEC, PCAOB, state boards)
- Stakeholders and investors

Requirements:
- Follow professional auditing standards (GAAS, PCAOB)
- Use precise accounting terminology
- Cite specific finding numbers and evidence
- Provide actionable recommendations
- Rate findings by severity (Critical, High, Medium, Low)
- Include management response requirements`;

    const userPrompt = `Create a government-compliant audit summary report.

COMPLIANCE CHECKS PERFORMED:
${JSON.stringify(complianceChecks, null, 2)}

FRAUD DETECTION FINDINGS:
${JSON.stringify(fraudFindings, null, 2)}

REQUIRED REPORT STRUCTURE:

1. EXECUTIVE SUMMARY
   - Overall opinion (Unqualified/Qualified/Adverse)
   - Total findings by severity
   - Critical issues requiring immediate action
   - Audit scope and methodology

2. SCOPE & OBJECTIVES
   - Audit period and entities covered
   - Standards and frameworks applied (SOC 2, GAAP, IFRS)
   - Testing methodology

3. COMPLIANCE STATUS
   - Regulatory compliance assessment (IFRS, GAAP, SOX, SEBI)
   - Policy adherence analysis
   - Control effectiveness evaluation
   - Specific regulation citations

4. FRAUD RISK ASSESSMENT
   - Fraud triangle analysis (Opportunity, Pressure, Rationalization)
   - Red flags identified with evidence
   - Fraud risk rating by area
   - Comparison to industry benchmarks

5. DETAILED FINDINGS
   For each finding, include:
   - Finding number and title
   - Severity level (Critical/High/Medium/Low)
   - Root cause analysis
   - Business impact (financial, operational, reputational)
   - Evidence and specific examples
   - Regulatory implications

6. RECOMMENDATIONS
   - Specific corrective actions with priorities
   - Implementation timelines (30/60/90 days)
   - Resource requirements
   - Success criteria and KPIs

7. MANAGEMENT ACTION PLAN
   - Required management responses
   - Follow-up audit schedule
   - Monitoring and reporting requirements

FORMAT: Professional audit report format with numbered findings, tables for summary data, and clear section headings.
COMPLIANCE: Must meet government audit standards and be suitable for regulatory submission.`;

    const completion = await openai.chat.completions.create({
      model: REPORT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: HIGH_ACCURACY_TEMP,
      max_tokens: 3000,
    });

    return completion.choices[0].message.content || "";
  }

  async generateRiskReport(
    riskAnalysis: any,
    predictions: any,
    monteCarloResults: any
  ): Promise<string> {
    const prompt = `Generate a comprehensive risk assessment report.

Risk Analysis:
${JSON.stringify(riskAnalysis, null, 2)}

Predictive Analysis:
${JSON.stringify(predictions, null, 2)}

Monte Carlo Simulation:
${JSON.stringify(monteCarloResults, null, 2)}

Create detailed risk report with:
1. Risk Executive Summary
2. Current Risk Exposure
3. Predictive Risk Scenarios
4. Value at Risk (VaR) Analysis
5. Stress Test Results
6. Mitigation Strategies

Format as professional risk management document.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a risk management analyst creating professional risk reports.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.25,
    });

    return completion.choices[0].message.content || "";
  }

  async generateComplianceReport(
    complianceData: any[],
    period: string
  ): Promise<string> {
    const prompt = `Generate a regulatory compliance report for ${period}.

Compliance Data:
${JSON.stringify(complianceData, null, 2)}

Create compliance report with:
1. Compliance Overview
2. IFRS/GAAP Compliance Status
3. SEBI Regulatory Compliance
4. SOX Requirements Status
5. ESG Disclosure Review
6. Recommendations for Improvement

Format as formal regulatory compliance document.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a compliance officer creating regulatory compliance reports.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content || "";
  }

  async generateBoardDeck(
    executiveSummary: string,
    keyMetrics: any[],
    strategicInsights: any[]
  ): Promise<string> {
    const prompt = `Generate a board presentation deck outline.

Executive Summary:
${executiveSummary}

Key Metrics:
${JSON.stringify(keyMetrics, null, 2)}

Strategic Insights:
${JSON.stringify(strategicInsights, null, 2)}

Create board deck structure with:
1. Executive Summary Slide
2. Financial Performance Highlights
3. Key Metrics Dashboard
4. Strategic Initiatives
5. Risk & Opportunities
6. Recommendations & Next Steps

Provide slide-by-slide content outline.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an executive creating board presentation materials.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "";
  }

  async generateTaxFilingReport(
    financialData: any,
    taxYear: string
  ): Promise<string> {
    const prompt = `Generate a comprehensive tax filing report for tax year ${taxYear}.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Create detailed tax filing report with:
1. Tax Summary Overview
2. Income Statement for Tax Purposes
3. Deductions and Credits Itemization
4. Capital Gains/Losses Summary
5. Estimated Tax Liability
6. Payment Schedule and Deadlines
7. Required Supporting Documentation
8. Tax Optimization Recommendations

Format as professional tax filing document compliant with IRS/government standards.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a certified tax accountant creating government tax filing reports.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content || "";
  }

  async generateSECFiling(
    companyData: any,
    filingType: string,
    fiscalPeriod: string
  ): Promise<string> {
    const systemPrompt = `You are a securities attorney and CFO with SEC filing expertise.
You create regulatory filings that comply with:
- Securities Act of 1933
- Securities Exchange Act of 1934
- Regulation S-K and S-X
- EDGAR filing requirements
- Sarbanes-Oxley Act (SOX)

Your filings are used by:
- SEC examiners and enforcement
- Public investors making investment decisions
- Financial analysts and rating agencies
- Legal counsel in due diligence

Requirements:
- Follow SEC format exactly (Item numbers, required disclosures)
- Include all required certifications
- Use appropriate legal language
- Cite specific accounting standards (GAAP)
- Include forward-looking statements safe harbor
- Provide risk factors in order of significance`;

    const userPrompt = `Create a ${filingType} SEC regulatory filing for fiscal period ${fiscalPeriod}.

COMPANY INFORMATION:
${JSON.stringify(companyData, null, 2)}

REQUIRED ${filingType} STRUCTURE:

PART I - BUSINESS AND FINANCIAL INFORMATION

Item 1. Business
- Company overview and history
- Business segments and products/services
- Markets and competitive position
- Employees and human capital
- Government regulation

Item 1A. Risk Factors
- Market and economic risks
- Operational risks
- Financial and credit risks
- Legal and regulatory risks
- Technology and cybersecurity risks
- Forward-looking statements disclaimer

Item 2. Properties
- Principal facilities and locations
- Owned vs. leased properties

Item 3. Legal Proceedings
- Material litigation and regulatory matters

Item 4. Mine Safety Disclosures (if applicable)

PART II - FINANCIAL INFORMATION

Item 5. Market for Common Equity
- Stock price history and trading information
- Dividend policy
- Stock performance graph

Item 6. Selected Financial Data
- 5-year financial data table
- Key performance indicators

Item 7. Management's Discussion and Analysis (MD&A)
- Executive Overview
- Critical Accounting Policies
- Results of Operations (by segment)
- Liquidity and Capital Resources
- Off-Balance Sheet Arrangements
- Contractual Obligations
- Known trends and uncertainties

Item 8. Financial Statements and Supplementary Data
- Consolidated Balance Sheets
- Consolidated Statements of Income
- Consolidated Statements of Cash Flows
- Consolidated Statements of Shareholders' Equity
- Notes to Financial Statements

Item 9. Changes in and Disagreements with Accountants

Item 9A. Controls and Procedures
- Management's Report on Internal Control
- Changes in Internal Control over Financial Reporting

PART III - DIRECTORS, EXECUTIVE OFFICERS AND CORPORATE GOVERNANCE

Item 10. Directors, Executive Officers and Corporate Governance
Item 11. Executive Compensation
Item 12. Security Ownership
Item 13. Certain Relationships and Related Transactions
Item 14. Principal Accounting Fees and Services

PART IV - EXHIBITS AND FINANCIAL STATEMENT SCHEDULES

Item 15. Exhibits, Financial Statement Schedules
- List of required exhibits
- Certifications under SOX Section 302 and 906

SIGNATURES
- Required signatures from CEO, CFO, and directors

FORMAT: Official SEC filing format with proper item numbering, tables, and regulatory language.
COMPLIANCE: Must be EDGAR-compatible and meet all SEC disclosure requirements for ${filingType} filing.`;

    const completion = await openai.chat.completions.create({
      model: REPORT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: HIGH_ACCURACY_TEMP,
      max_tokens: 4000,
    });

    return completion.choices[0].message.content || "";
  }

  async createCustomReport(
    template: ReportTemplate,
    data: any
  ): Promise<GeneratedReport> {
    const reportId = crypto.randomUUID();
    let reportContent = `# ${template.name}\n\n`;

    for (const section of template.sections) {
      reportContent += `## ${section.title}\n\n`;

      if (section.type === "narrative" && section.content) {
        reportContent += `${section.content}\n\n`;
      } else if (section.type === "data_table") {
        reportContent += "| Metric | Value |\n|--------|-------|\n";
        if (data[section.dataSource || ""]) {
          const tableData = data[section.dataSource || ""];
          Object.entries(tableData).forEach(([key, value]) => {
            reportContent += `| ${key} | ${value} |\n`;
          });
        }
        reportContent += "\n";
      } else if (section.type === "executive_summary") {
        reportContent += `${data.executiveSummary || "Summary pending..."}\n\n`;
      }
    }

    return {
      id: reportId,
      templateId: template.id,
      companyId: data.companyId || "unknown",
      period: data.period || new Date().toISOString().split("T")[0],
      format: template.format,
      content: reportContent,
      metadata: {
        generatedAt: new Date(),
        generatedBy: "system",
        dataSourcesUsed: Object.keys(data),
        pageCount: Math.ceil(reportContent.split("\n").length / 40),
      },
    };
  }
}

export const reportGenerator = new ReportGeneratorService();
