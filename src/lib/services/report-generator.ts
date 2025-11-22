// Report Generation & Automation
import OpenAI from "openai";
import { GeneratedReport, ReportTemplate } from "@/lib/types/enterprise";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ReportGeneratorService {
  async generateInvestorMemo(
    companyData: {
      name: string;
      financials: any;
      analysis: any;
      risks: string[];
    }
  ): Promise<string> {
    const prompt = `Generate a professional investor memo for ${companyData.name}.

Financial Data:
${JSON.stringify(companyData.financials, null, 2)}

Analysis Results:
${JSON.stringify(companyData.analysis, null, 2)}

Key Risks:
${companyData.risks.join("\n")}

Create a comprehensive investor memo with:
1. Executive Summary
2. Financial Performance Analysis
3. Key Metrics & Ratios
4. Risk Assessment
5. Investment Recommendation

Format as professional business document.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst creating professional investor memos.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "";
  }

  async generateAuditSummary(
    complianceChecks: any[],
    fraudFindings: any[]
  ): Promise<string> {
    const prompt = `Generate an audit summary report.

Compliance Checks:
${JSON.stringify(complianceChecks, null, 2)}

Fraud Detection Findings:
${JSON.stringify(fraudFindings, null, 2)}

Create a comprehensive audit summary with:
1. Executive Summary
2. Compliance Status
3. Fraud Risk Assessment
4. Key Findings & Issues
5. Recommendations
6. Required Actions

Format as professional audit report.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an audit professional creating formal audit reports.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
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
    const prompt = `Generate a ${filingType} SEC filing for fiscal period ${fiscalPeriod}.

Company Data:
${JSON.stringify(companyData, null, 2)}

Create comprehensive SEC filing with:
1. Cover Page and Filing Information
2. Business Overview and Operations
3. Risk Factors and Forward-Looking Statements
4. Financial Data and Analysis (MD&A)
5. Financial Statements (Balance Sheet, Income Statement, Cash Flow)
6. Notes to Financial Statements
7. Management Certifications
8. Exhibits and Supplemental Information

Format as professional SEC filing document compliant with SEC regulations and EDGAR filing standards.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a securities attorney and financial expert creating SEC regulatory filings.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.15,
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
