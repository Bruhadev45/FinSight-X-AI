"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Headphones,
    Download,
    MoreHorizontal
} from "lucide-react";

export const AudioSummaryPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);

    // Mock duration in seconds (2:30)
    const duration = 150;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + (100 / duration);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTime = (progress / 100) * duration;

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Headphones className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <Badge variant="outline" className="mb-2 text-blue-200 border-blue-400/30 bg-blue-500/10">
                                AI Generated Summary
                            </Badge>
                            <h3 className="font-bold text-lg">Tesla Q3 2024 Financial Highlights</h3>
                            <p className="text-sm text-slate-400">Generated on Nov 19, 2025 • 2 min 30 sec</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>

                {/* Waveform Visualization (Mock) */}
                <div className="h-12 flex items-center gap-1 mb-6 opacity-50">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-blue-400 rounded-full transition-all duration-300"
                            style={{
                                height: `${Math.max(20, Math.random() * 100)}%`,
                                opacity: (i / 40) * 100 < progress ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <Slider
                        value={[progress]}
                        max={100}
                        step={1}
                        onValueChange={(val) => setProgress(val[0])}
                        className="cursor-pointer"
                    />

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-300 hover:text-white hover:bg-white/10"
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="w-24">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={100}
                                    onValueChange={(val) => setVolume(val[0])}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                                <SkipBack className="h-6 w-6" />
                            </Button>
                            <Button
                                size="icon"
                                className="h-12 w-12 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform hover:scale-105"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                                <SkipForward className="h-6 w-6" />
                            </Button>
                        </div>

                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
