"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export function HeroSection({ scrollToSection }: { scrollToSection: (id: string) => void }) {
    return (
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Hero Content */}
                <div>
                    <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 animate-fade-in-down opacity-0">
                        <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
                        Powered by Advanced AI Technology
                    </Badge>

                    <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight font-playfair animate-fade-in-up opacity-0 delay-100">
                        AI-Powered
                        <br />
                        <span className="animated-gradient-text">
                            Financial Intelligence
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed animate-fade-in-up opacity-0 delay-200">
                        Enterprise-grade document analysis, fraud detection, and compliance monitoring.
                        Powered by 5 specialized AI agents working 24/7 to protect your financial operations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up opacity-0 delay-300">
                        <Link href="/dashboard">
                            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover-lift animate-glow">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 hover-lift"
                            onClick={() => scrollToSection("contact")}
                        >
                            Schedule Demo
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium">99.9% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium">SOC 2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium">256-bit Encryption</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Stats Card */}
                <div className="relative animate-fade-in-right opacity-0 delay-200">
                    <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950 border-2 border-blue-200 dark:border-blue-800 shadow-2xl hover-lift animate-float">
                        <CardHeader>
                            <CardTitle className="text-2xl">Platform Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg">
                                    <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">98.5%</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Detection Accuracy</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">&lt;30s</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Time to Insight</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1000+</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Docs/Day</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-lg">
                                    <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">24/7</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">AI Monitoring</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Floating Badge */}
                    <div className="absolute -top-6 -right-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg transform rotate-12 animate-bounce">
                        <span className="font-bold">14 Features</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
