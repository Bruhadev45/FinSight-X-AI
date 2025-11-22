"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ZoomIn, ZoomOut, RefreshCw, Building2, User, FileText, DollarSign } from "lucide-react";

interface Node {
    id: string;
    type: "company" | "person" | "document" | "metric";
    label: string;
    x: number;
    y: number;
    connections: string[];
}

export const VisualKnowledgeGraph = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [scale, setScale] = useState(1);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mock Data Generation
    useEffect(() => {
        const generateGraph = () => {
            const newNodes: Node[] = [
                { id: "1", type: "company", label: "Tesla, Inc.", x: 400, y: 300, connections: ["2", "3", "4", "5"] },
                { id: "2", type: "person", label: "Elon Musk", x: 250, y: 200, connections: ["1"] },
                { id: "3", type: "document", label: "Q3 2024 Report", x: 550, y: 200, connections: ["1", "6"] },
                { id: "4", type: "metric", label: "Revenue $24B", x: 300, y: 450, connections: ["1"] },
                { id: "5", type: "metric", label: "Margin 18%", x: 500, y: 450, connections: ["1"] },
                { id: "6", type: "company", label: "NVIDIA", x: 700, y: 250, connections: ["3"] },
            ];
            setNodes(newNodes);
        };
        generateGraph();
    }, []);

    const getNodeIcon = (type: string) => {
        switch (type) {
            case "company": return <Building2 className="h-5 w-5" />;
            case "person": return <User className="h-5 w-5" />;
            case "document": return <FileText className="h-5 w-5" />;
            case "metric": return <DollarSign className="h-5 w-5" />;
            default: return <Network className="h-5 w-5" />;
        }
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case "company": return "bg-blue-500 border-blue-600";
            case "person": return "bg-purple-500 border-purple-600";
            case "document": return "bg-slate-500 border-slate-600";
            case "metric": return "bg-green-500 border-green-600";
            default: return "bg-gray-500";
        }
    };

    return (
        <Card className="h-[600px] flex flex-col overflow-hidden border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-blue-600" />
                        Interactive Knowledge Graph
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setNodes([...nodes])}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-move">
                <div
                    className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
                    style={{ transform: `scale(${scale})` }}
                />

                <div
                    ref={containerRef}
                    className="w-full h-full relative"
                    style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
                >
                    {/* Connections (SVG Lines) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {nodes.map(node =>
                            node.connections.map(targetId => {
                                const target = nodes.find(n => n.id === targetId);
                                if (!target) return null;
                                return (
                                    <motion.line
                                        key={`${node.id}-${targetId}`}
                                        x1={node.x}
                                        y1={node.y}
                                        x2={target.x}
                                        y2={target.y}
                                        stroke="currentColor"
                                        className="text-slate-300 dark:text-slate-700"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1 }}
                                    />
                                );
                            })
                        )}
                    </svg>

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <motion.div
                            key={node.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.1 }}
                            drag
                            dragConstraints={containerRef}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 flex flex-col items-center gap-2`}
                            style={{ left: node.x, top: node.y }}
                            onClick={() => setSelectedNode(node.id)}
                        >
                            <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${getNodeColor(node.type)} ${selectedNode === node.id ? 'ring-4 ring-blue-400/50' : ''}`}>
                                {getNodeIcon(node.type)}
                            </div>
                            <Badge variant="secondary" className="shadow-sm bg-white dark:bg-slate-800">
                                {node.label}
                            </Badge>
                        </motion.div>
                    ))}
                </div>

                {/* Info Panel */}
                {selectedNode && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute right-4 top-4 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-20"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Node Details</h4>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedNode(null)}>×</Button>
                        </div>
                        {(() => {
                            const node = nodes.find(n => n.id === selectedNode);
                            if (!node) return null;
                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Badge>{node.type}</Badge>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Connected to {node.connections.length} other entities.
                                    </p>
                                    <div className="pt-2 border-t">
                                        <Button size="sm" className="w-full">View Documents</Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
};
