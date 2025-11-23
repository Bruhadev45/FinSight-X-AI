"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is FinSight X AI?",
    answer: "FinSight X AI is an enterprise-grade financial intelligence platform that uses advanced AI and machine learning to analyze financial documents, detect fraud, predict risks, and provide real-time alerts. It helps financial professionals make data-driven decisions with confidence."
  },
  {
    question: "How does the fraud detection work?",
    answer: "Our AI-powered fraud detection uses pattern recognition, anomaly detection, and behavioral analytics to identify suspicious activities. The system analyzes transactions, documents, and financial statements in real-time, flagging potential fraud with 94.7% accuracy. It also provides detailed explanations and source citations for every alert."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use 256-bit encryption for data at rest and in transit, SOC 2 certified infrastructure, and comply with GDPR, CCPA, and other data protection regulations. Your data is stored in secure, region-specific data centers with role-based access controls and complete audit trails."
  },
  {
    question: "Can I integrate FinSight X with my existing systems?",
    answer: "Yes! FinSight X offers REST & gRPC APIs, webhooks, and pre-built connectors for popular platforms like QuickBooks, SAP, Power BI, Tableau, Google Drive, and S3. We also support custom integrations through our comprehensive API documentation."
  },
  {
    question: "What types of documents can FinSight X analyze?",
    answer: "FinSight X can analyze various financial documents including 10-K/10-Q filings, audit reports, financial statements, tax returns, invoices, contracts, and more. Our AI-powered OCR and table recognition works with PDFs, Excel files, and scanned documents."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! We offer a 14-day free trial with full access to all Professional plan features. No credit card required. You can explore document analysis, fraud detection, predictive analytics, and all our AI-powered tools risk-free."
  },
  {
    question: "How accurate are the AI predictions?",
    answer: "Our predictive analytics models achieve 85-95% accuracy depending on the use case. We use LSTM neural networks, Monte Carlo simulations, and ensemble methods trained on millions of financial data points. Every prediction comes with a confidence score and methodology explanation."
  },
  {
    question: "What support options are available?",
    answer: "We offer email support for all plans, priority support for Business plans, and dedicated account managers with 24/7 support for Enterprise customers. We also provide comprehensive documentation, video tutorials, and regular webinars."
  },
  {
    question: "Can I customize the platform for my organization?",
    answer: "Yes! Enterprise plans include custom workflows, white-labeling options, custom AI model training, and tailored integrations. We work closely with your team to configure the platform according to your specific requirements and compliance needs."
  },
  {
    question: "How does pricing work?",
    answer: "We offer flexible pricing based on your needs: Professional ($79/mo) for small teams, Business ($399/mo) for growing companies, and custom Enterprise pricing for large organizations. All plans include unlimited users and scale with your document volume and API usage."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-purple-500 text-purple-600">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about FinSight X AI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border-slate-200 dark:border-slate-800 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    {openIndex === index && (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 mt-1 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Contact our team →
          </a>
        </div>
      </div>
    </section>
  );
};
