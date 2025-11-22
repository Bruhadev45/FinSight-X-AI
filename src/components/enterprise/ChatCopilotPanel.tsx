"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  context?: {
    documents?: string[];
    metrics?: string[];
  };
}

const suggestedQuestions = [
  "Summarize Q2 liquidity risk for ABC Ltd",
  "What are the compliance violations in the latest filings?",
  "Compare financial performance across all companies",
  "Show me documents with high fraud risk",
  "What's the trend in debt-to-equity ratios?",
  "List all critical alerts from this week"
];

export const ChatCopilotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Hello! I'm your Financial Intelligence Copilot. I can help you analyze documents, answer questions about financial data, and provide insights based on your company database. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with RAG context
    setTimeout(() => {
      const responses: Record<string, string> = {
        "liquidity": "📊 **Q2 Liquidity Risk Analysis for ABC Ltd:**\n\n• Current Ratio: 1.85 (up from 1.62 in Q1)\n• Quick Ratio: 1.23 (healthy, above industry avg of 1.0)\n• Cash Position: $12.4M (increased 18% QoQ)\n• Working Capital: $8.9M positive\n\n⚠️ **Key Findings:**\n- Improved liquidity position\n- Reduced reliance on short-term debt\n- Strong cash flow from operations\n\n✅ **Risk Assessment:** LOW (Previously: MEDIUM)\n\nBased on 4 financial documents and 12 data points from Q2 2024.",
        "compliance": "🛡️ **Compliance Violations Summary:**\n\nFound 3 violations across 8 companies:\n\n**Critical (1):**\n• XYZ Corp - Missing ESG disclosure (Required by Q4 2024)\n\n**Medium (2):**\n• ABC Ltd - Late filing submission (3 days overdue)\n• DEF Inc - Incomplete board composition disclosure\n\n📋 All violations have been flagged for immediate action.\n\nBased on analysis of 156 documents against IFRS, GDPR, and SOX standards.",
        "compare": "📈 **Financial Performance Comparison:**\n\n**Top Performers:**\n1. ABC Ltd - Revenue Growth: +24%, Profit Margin: 18.5%\n2. JKL Corp - Revenue Growth: +19%, Profit Margin: 16.2%\n3. MNO Inc - Revenue Growth: +15%, Profit Margin: 14.8%\n\n**Key Metrics:**\n• Average Revenue Growth: +12.4%\n• Average Profit Margin: 12.6%\n• Industry Benchmark: 10.8%\n\n🎯 **Insights:**\n- Top 3 companies outperforming market by 40%+\n- Strong correlation between R&D spend and growth\n- Tech sector leading with 22% avg growth\n\nAnalyzed 25 companies with 487 financial documents.",
        "fraud": "🚨 **High Fraud Risk Documents:**\n\nIdentified 7 documents flagged for review:\n\n**Critical Risk (2):**\n• Invoice #4521 - GHI Corp (Duplicate transaction pattern)\n• Statement_Q3 - PQR Ltd (Unusual revenue recognition)\n\n**High Risk (5):**\n• Contract_ABC - Missing signatures\n• Ledger_2024 - Data inconsistencies\n• Receipt_7823 - Amount discrepancies\n\n⚠️ **Recommended Actions:**\n1. Immediate manual review required\n2. Contact company representatives\n3. Request supporting documentation\n\nFraud detection confidence: 87-94%",
        "trend": "📊 **Debt-to-Equity Ratio Trends:**\n\n**Overall Trend:** Decreasing ⬇️ (Positive)\n\n**Average Ratios:**\n• Q1 2024: 1.85\n• Q2 2024: 1.72 (-7%)\n• Q3 2024: 1.58 (-8%)\n• Q4 2024: 1.45 (-8%)\n\n**Best Performers:**\n• ABC Ltd: 0.82 (Excellent)\n• JKL Corp: 1.12 (Good)\n• MNO Inc: 1.28 (Acceptable)\n\n**Attention Needed:**\n• STU Corp: 2.45 (High leverage)\n• VWX Ltd: 2.18 (Monitor closely)\n\n💡 Industry benchmark: 1.5 - Most companies improving financial health\n\nData from 156 financial statements across 25 companies.",
        "alerts": "🔔 **Critical Alerts This Week:**\n\n**Critical (3):**\n• ABC Ltd - Compliance violation detected\n• XYZ Corp - Fraud pattern identified\n• DEF Inc - High risk score (8.5/10)\n\n**High (8):**\n• Credit default risk increased\n• Missing regulatory filings\n• Unusual transaction patterns\n• Cash flow concerns\n\n**Summary:**\n• Total Alerts: 23\n• Resolved: 12\n• Pending Review: 11\n• Average Response Time: 2.4 hours\n\n📊 Alert volume up 15% from last week - increased monitoring recommended."
      };

      let response = "I've analyzed your query using semantic search across all documents and financial data. ";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("liquidity") || lowerText.includes("abc")) {
        response = responses.liquidity;
      } else if (lowerText.includes("compliance") || lowerText.includes("violation")) {
        response = responses.compliance;
      } else if (lowerText.includes("compare") || lowerText.includes("performance")) {
        response = responses.compare;
      } else if (lowerText.includes("fraud")) {
        response = responses.fraud;
      } else if (lowerText.includes("trend") || lowerText.includes("debt")) {
        response = responses.trend;
      } else if (lowerText.includes("alert")) {
        response = responses.alerts;
      } else {
        response = `I can help you with that! Based on my analysis:\n\n${text}\n\nI've searched through your document database and found relevant information. Here's what I can tell you:\n\n• Found 24 related documents\n• Analyzed 156 data points\n• Confidence level: 89%\n\nWould you like me to provide more specific details or drill down into any particular aspect?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        context: {
          documents: ["Statement_Q2_ABC.pdf", "Analysis_2024.xlsx", "Compliance_Report.pdf"],
          metrics: ["Revenue", "Debt Ratio", "Cash Flow"]
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Financial Intelligence Copilot
          </CardTitle>
          <CardDescription>
            AI-powered query assistant with RAG context from your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested Questions */}
          <div>
            <p className="text-sm font-medium mb-2">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(q)}
                  className="text-xs"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                      {message.context && (
                        <div className="mt-2 space-y-1">
                          {message.context.documents && (
                            <div className="flex flex-wrap gap-1">
                              {message.context.documents.map((doc, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim() && !isTyping) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything about your financial data..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              disabled={!input.trim() || isTyping}
              type="button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
