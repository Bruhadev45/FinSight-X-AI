"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Lock } from "lucide-react";

export function ServicesSection() {
    const services = [
        {
            title: "Financial Document Analysis",
            description: "Comprehensive analysis of invoices, receipts, statements, and reports with AI-powered insights and validation.",
            features: ["Multi-format support (PDF, DOCX, XLSX, CSV, TXT)", "Real-time processing", "Historical tracking"],
        },
        {
            title: "Enterprise Intelligence",
            description: "Advanced document intelligence platform with batch processing, citation tracking, and smart search capabilities.",
            features: ["Batch upload up to 50 documents", "Natural language search", "Document comparison tools"],
        },
        {
            title: "Compliance & Security",
            description: "Automated compliance monitoring and fraud detection with industry-leading accuracy and 24/7 surveillance.",
            features: ["SOC 2 compliant infrastructure", "256-bit encryption", "Real-time fraud alerts"],
        },
    ];

    return (
        <section id="services" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                    WHAT WE OFFER
                </Badge>
                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-playfair">
                    Our Services
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Comprehensive AI-powered financial intelligence solutions for businesses of all sizes
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <Card
                        key={index}
                        className="bg-white dark:bg-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    >
                        <CardHeader>
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                {service.description}
                            </p>
                            <ul className="space-y-3">
                                {service.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Value Proposition */}
            <Card className="mt-16 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 border-0 text-white">
                <CardContent className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold mb-2 font-playfair leading-tight">90%+</div>
                            <div className="text-sm text-blue-100 font-space-grotesk leading-snug">Cost Savings</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold mb-2 font-playfair leading-tight">5 AI</div>
                            <div className="text-sm text-blue-100 font-space-grotesk leading-snug">Specialized Agents</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold mb-2 font-playfair leading-tight">100K+</div>
                            <div className="text-sm text-blue-100 font-space-grotesk leading-snug">Documents Analyzed</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold mb-2 font-playfair leading-tight">&lt;2s</div>
                            <div className="text-sm text-blue-100 font-space-grotesk leading-snug">Average Response</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
