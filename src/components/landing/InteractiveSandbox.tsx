"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    FileText,
    Activity,
    PieChart,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Play
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";

export const InteractiveSandbox = () => {
    const [step, setStep] = useState<"upload" | "analyzing" | "results">("upload");
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const demoFiles = [
        { id: "tesla", name: "Tesla Q3 2024 Report", type: "10-Q" },
        { id: "nvidia", name: "NVIDIA Annual Report", type: "10-K" },
        { id: "apple", name: "Apple Financial Statement", type: "8-K" },
    ];

    const handleDemoSelect = (id: string) => {
        setSelectedDemo(id);
        setStep("analyzing");
        // Simulate analysis
        setTimeout(() => {
            setStep("results");
        }, 2500);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = (file: File) => {
        // Redirect to dashboard documents page for actual upload
        router.push('/dashboard/documents');
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const mockData = [
        { name: "Revenue", value: 24.3, prev: 21.1 },
        { name: "Op. Income", value: 4.2, prev: 3.8 },
        { name: "Net Income", value: 3.1, prev: 2.9 },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4 border-blue-500 text-blue-600">
                        Interactive Demo
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                        Try FinSight X AI Live
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Experience the power of our AI engine instantly. No sign-up required.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side: Document Viewer / Upload */}
                        <Card className="h-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5))]" />

                            <CardContent className="relative h-full p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono">viewer.pdf</div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {step === "upload" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex-1 flex flex-col items-center justify-center text-center"
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.xlsx,.csv"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <div
                                                className={`w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 transition-all cursor-pointer ${
                                                    dragActive ? 'scale-110 bg-blue-100 dark:bg-blue-900/40' : ''
                                                }`}
                                                onClick={handleButtonClick}
                                            >
                                                <Upload className="h-10 w-10 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Upload Financial Document</h3>
                                            <p className="text-sm text-slate-500 mb-4 max-w-xs">
                                                Drag & drop PDF or click to upload
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mb-6"
                                                onClick={handleButtonClick}
                                            >
                                                Choose File
                                            </Button>

                                            <div className="w-full max-w-xs mb-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-xs">
                                                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or try a demo</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                                {demoFiles.map((file) => (
                                                    <button
                                                        key={file.id}
                                                        onClick={() => handleDemoSelect(file.id)}
                                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group text-left"
                                                    >
                                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded group-hover:bg-white dark:group-hover:bg-slate-700">
                                                            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {file.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {file.type} • PDF
                                                            </div>
                                                        </div>
                                                        <Play className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === "analyzing" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex-1 flex flex-col items-center justify-center"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                                                <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative z-10" />
                                            </div>
                                            <h3 className="text-lg font-semibold mt-6 mb-2">Analyzing Document...</h3>
                                            <div className="space-y-2 w-full max-w-xs">
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>Extracting financial tables</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>Identifying key entities</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                    <span>Calculating risk metrics</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === "results" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg p-4 overflow-hidden border border-slate-200 dark:border-slate-800"
                                        >
                                            {/* Simulated PDF View */}
                                            <div className="space-y-4 opacity-50 pointer-events-none blur-[1px]">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                                                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded w-full mt-8" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
                                                <Button variant="outline" onClick={() => setStep("upload")}>
                                                    Analyze Another
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Right Side: Live Insights */}
                        <div className="space-y-6">
                            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-lg">Live AI Insights</h3>
                                    </div>

                                    {step === "results" ? (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                                                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Revenue Growth</div>
                                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">+15.2%</div>
                                                </div>
                                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900">
                                                    <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Risk Score</div>
                                                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">Medium</div>
                                                </div>
                                            </div>

                                            <div className="h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={mockData}>
                                                        <XAxis dataKey="name" fontSize={12} />
                                                        <YAxis fontSize={12} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        />
                                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                    <p>
                                                        <span className="font-semibold">Supply Chain Risk:</span> Potential disruption noted in semiconductor procurement section (Page 12).
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                                                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <p>
                                                        <span className="font-semibold">Margin Expansion:</span> Gross margins improved by 240bps due to operational efficiencies.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                                            <PieChart className="h-16 w-16 mb-4 opacity-20" />
                                            <p>Upload a document to see live insights</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
