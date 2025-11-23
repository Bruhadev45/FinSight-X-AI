"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Shield,
    Brain,
    Bell,
    Upload,
    FileSearch,
    GitCompare,
    FileText,
    Search,
    TrendingUp,
    BarChart3,
    AlertTriangle,
    FileCheck,
    ArrowRight,
    Zap,
    Sparkles,
} from "lucide-react";

export function FeaturesSection() {
    // CORE BUSINESS OPERATIONS - Document Intelligence
    const documentIntelligenceFeatures = [
        {
            icon: Upload,
            title: "Document Upload & Processing",
            description: "Upload financial documents with automatic AI analysis and entity extraction",
            color: "blue",
            category: "Core",
        },
        {
            icon: FileText,
            title: "Document Intelligence",
            description: "Auto-extract entities, metrics, compliance data, and risk scores from any document",
            color: "indigo",
            category: "AI",
        },
        {
            icon: Search,
            title: "Advanced Search",
            description: "NLP-enhanced semantic search with smart filters and relevance scoring",
            color: "green",
            category: "AI",
        },
        {
            icon: GitCompare,
            title: "Document Comparison",
            description: "Side-by-side comparison with AI-powered change detection and similarity scoring",
            color: "purple",
            category: "Advanced",
        },
    ];

    // SECURITY & COMPLIANCE - Risk Management
    const securityComplianceFeatures = [
        {
            icon: Shield,
            title: "Fraud Detection",
            description: "98.5% accuracy with 6-pattern multi-layer fraud detection system",
            color: "red",
            category: "Security",
        },
        {
            icon: FileCheck,
            title: "Compliance Monitoring",
            description: "Automated regulatory compliance checks (SEC, FINRA, GDPR) with real-time validation",
            color: "green",
            category: "Compliance",
        },
        {
            icon: AlertTriangle,
            title: "Anomaly Detection",
            description: "Real-time detection of unusual patterns, suspicious activities, and outliers",
            color: "amber",
            category: "Security",
        },
        {
            icon: Bell,
            title: "Smart Alerts",
            description: "Instant notifications with severity-based prioritization and custom rules",
            color: "orange",
            category: "Core",
        },
    ];

    // ENTERPRISE FEATURES
    const enterpriseFeatures = [
        {
            icon: Upload,
            title: "Batch Processing",
            description: "Upload and analyze 10-50 documents simultaneously with progress tracking",
        },
        {
            icon: FileSearch,
            title: "Citation Tracking",
            description: "Every AI insight linked to source documents with confidence scores and context",
        },
        {
            icon: Zap,
            title: "Real-time Processing",
            description: "Process documents in under 30 seconds with instant AI-powered insights",
        },
    ];

    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-0">
                    CORE CAPABILITIES
                </Badge>
                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-poppins">
                    AI-Powered Features
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Comprehensive suite of intelligent tools designed for enterprise financial operations
                </p>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {[...documentIntelligenceFeatures, ...securityComplianceFeatures.slice(0, 2)].map((feature, index) => {
                    const Icon = feature.icon;
                    const colorMap: Record<string, { card: string; iconBg: string; iconText: string }> = {
                        blue: {
                            card: "from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800",
                            iconBg: "bg-blue-100 dark:bg-blue-900/50",
                            iconText: "text-blue-600 dark:text-blue-400"
                        },
                        red: {
                            card: "from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-200 dark:border-red-800",
                            iconBg: "bg-red-100 dark:bg-red-900/50",
                            iconText: "text-red-600 dark:text-red-400"
                        },
                        green: {
                            card: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800",
                            iconBg: "bg-green-100 dark:bg-green-900/50",
                            iconText: "text-green-600 dark:text-green-400"
                        },
                        amber: {
                            card: "from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800",
                            iconBg: "bg-amber-100 dark:bg-amber-900/50",
                            iconText: "text-amber-600 dark:text-amber-400"
                        },
                        orange: {
                            card: "from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-orange-200 dark:border-orange-800",
                            iconBg: "bg-orange-100 dark:bg-orange-900/50",
                            iconText: "text-orange-600 dark:text-orange-400"
                        },
                        purple: {
                            card: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800",
                            iconBg: "bg-purple-100 dark:bg-purple-900/50",
                            iconText: "text-purple-600 dark:text-purple-400"
                        },
                        indigo: {
                            card: "from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-indigo-200 dark:border-indigo-800",
                            iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
                            iconText: "text-indigo-600 dark:text-indigo-400"
                        },
                    };

                    const colors = colorMap[feature.color as string] || colorMap.blue;

                    return (
                        <Card
                            key={index}
                            className={`bg-gradient-to-br ${colors.card} hover-lift animate-scale-in opacity-0 delay-${Math.min((index + 1) * 100, 800)}`}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-6 w-6 ${colors.iconText}`} />
                                    </div>
                                    <div>
                                        {feature.category && (
                                            <Badge variant="secondary" className="mb-2 text-xs">
                                                {feature.category}
                                            </Badge>
                                        )}
                                        <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Advanced Features Section */}
            <div className="mt-20">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0">
                        ADVANCED INTELLIGENCE
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Enterprise Document Intelligence
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Professional-grade tools for document analysis and management
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enterpriseFeatures.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={index}
                                className="bg-white dark:bg-slate-900 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-xl"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/dashboard/advanced-features">
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center mt-8">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
                        <Link href="/dashboard/advanced-features">
                            <Sparkles className="h-5 w-5 mr-2" />
                            Explore All Advanced Features
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
