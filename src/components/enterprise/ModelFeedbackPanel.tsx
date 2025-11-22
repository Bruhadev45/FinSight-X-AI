"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, AlertCircle, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FeedbackRecord {
  id: string;
  documentName: string;
  agent: string;
  predictionType: string;
  predictedValue: string;
  actualValue: string;
  isCorrect: boolean;
  feedbackType: "correct" | "false_positive" | "false_negative";
  reviewedBy: string;
  timestamp: string;
}

const feedbackData: FeedbackRecord[] = [
  {
    id: "1",
    documentName: "Financial_Statement_Q4.pdf",
    agent: "Fraud Detector",
    predictionType: "fraud_risk",
    predictedValue: "High",
    actualValue: "Medium",
    isCorrect: false,
    feedbackType: "false_positive",
    reviewedBy: "John Doe",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "2",
    documentName: "Balance_Sheet_2024.xlsx",
    agent: "Risk Analyzer",
    predictionType: "risk_level",
    predictedValue: "Medium",
    actualValue: "Medium",
    isCorrect: true,
    feedbackType: "correct",
    reviewedBy: "Jane Smith",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "3",
    documentName: "Compliance_Report.pdf",
    agent: "Compliance Checker",
    predictionType: "compliance_status",
    predictedValue: "Pass",
    actualValue: "Fail",
    isCorrect: false,
    feedbackType: "false_negative",
    reviewedBy: "Mike Johnson",
    timestamp: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: "4",
    documentName: "Invoice_5432.pdf",
    agent: "Anomaly Detector",
    predictionType: "anomaly",
    predictedValue: "Detected",
    actualValue: "Detected",
    isCorrect: true,
    feedbackType: "correct",
    reviewedBy: "Sarah Lee",
    timestamp: new Date(Date.now() - 14400000).toISOString()
  }
];

const accuracyTrend = [
  { month: "Jan", accuracy: 89.2, falsePositive: 8.1, falseNegative: 2.7 },
  { month: "Feb", accuracy: 91.5, falsePositive: 6.8, falseNegative: 1.7 },
  { month: "Mar", accuracy: 93.8, falsePositive: 4.9, falseNegative: 1.3 },
  { month: "Apr", accuracy: 94.5, falsePositive: 4.2, falseNegative: 1.3 },
  { month: "May", accuracy: 95.2, falsePositive: 3.6, falseNegative: 1.2 },
  { month: "Jun", accuracy: 96.1, falsePositive: 2.9, falseNegative: 1.0 }
];

const agentPerformance = [
  { agent: "Fraud Detector", accuracy: 94.2, reviewed: 1247 },
  { agent: "Risk Analyzer", accuracy: 96.8, reviewed: 2134 },
  { agent: "Compliance Checker", accuracy: 97.5, reviewed: 1856 },
  { agent: "Anomaly Detector", accuracy: 93.1, reviewed: 978 }
];

export const ModelFeedbackPanel = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const correctCount = feedbackData.filter(f => f.isCorrect).length;
  const falsePositiveCount = feedbackData.filter(f => f.feedbackType === "false_positive").length;
  const falseNegativeCount = feedbackData.filter(f => f.feedbackType === "false_negative").length;
  const overallAccuracy = (correctCount / feedbackData.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            Model Feedback Analytics
          </CardTitle>
          <CardDescription>
            Track false positives, human rejections, and accuracy trends for model governance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {overallAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-500">Overall Accuracy</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {correctCount}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">Correct Predictions</div>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {falsePositiveCount}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-500">False Positives</div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {falseNegativeCount}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-500">False Negatives</div>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accuracy Trend */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Accuracy Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="#86efac" name="Accuracy" />
                  <Area type="monotone" dataKey="falsePositive" stroke="#f59e0b" fill="#fbbf24" name="False Positive Rate" />
                  <Area type="monotone" dataKey="falseNegative" stroke="#ef4444" fill="#fca5a5" name="False Negative Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Performance by AI Agent</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Details Table */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Agent Performance Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Agent</th>
                      <th className="text-right p-2">Accuracy</th>
                      <th className="text-right p-2">Reviews</th>
                      <th className="text-right p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformance.map((agent, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-medium">{agent.agent}</td>
                        <td className="text-right p-2">
                          <Badge variant={agent.accuracy >= 95 ? "default" : "secondary"}>
                            {agent.accuracy}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">{agent.reviewed.toLocaleString()}</td>
                        <td className="text-right p-2">
                          <Badge variant={agent.accuracy >= 95 ? "default" : "destructive"}>
                            {agent.accuracy >= 95 ? "🟢 Excellent" : "🟡 Good"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <div>
            <h3 className="font-semibold mb-3">Recent Feedback Records</h3>
            <div className="space-y-2">
              {feedbackData.map((feedback) => (
                <Card key={feedback.id} className={`bg-white/50 dark:bg-slate-900/50 ${
                  !feedback.isCorrect ? 'border-orange-300 dark:border-orange-800' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {feedback.isCorrect ? (
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ThumbsDown className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{feedback.documentName}</h4>
                            <Badge variant={
                              feedback.feedbackType === "correct" ? "default" :
                              feedback.feedbackType === "false_positive" ? "destructive" : "secondary"
                            }>
                              {feedback.feedbackType === "correct" ? "✅ Correct" :
                               feedback.feedbackType === "false_positive" ? "⚠️ False Positive" : "❌ False Negative"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 text-xs">
                            <div>
                              <p className="text-gray-500 mb-0.5">Agent</p>
                              <p className="font-medium">{feedback.agent}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-0.5">Predicted</p>
                              <Badge variant="outline">{feedback.predictedValue}</Badge>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-0.5">Actual</p>
                              <Badge variant="outline">{feedback.actualValue}</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Reviewed by: {feedback.reviewedBy}</span>
                            <span>{new Date(feedback.timestamp).toLocaleString()}</span>
                          </div>

                          {!feedback.isCorrect && (
                            <div className="mt-2 bg-orange-50 dark:bg-orange-950 p-2 rounded text-xs text-orange-700 dark:text-orange-400">
                              ⚠️ Model prediction did not match human review. This feedback will be used to improve model accuracy.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Model Governance Info */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">📊 Model Governance Scorecard</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Overall model accuracy improved by 6.9% over last 6 months</p>
                <p>• False positive rate reduced from 8.1% to 2.9%</p>
                <p>• False negative rate reduced from 2.7% to 1.0%</p>
                <p>• All agents meet minimum 93% accuracy threshold</p>
                <p>• Compliance Checker leading with 97.5% accuracy</p>
                <p>• 6,215 total human reviews collected for continuous improvement</p>
                <p>• Model retraining scheduled quarterly based on feedback data</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
