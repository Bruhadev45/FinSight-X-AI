import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface OutputDisplayProps {
  content: string | React.ReactNode;
  type?: "success" | "info" | "warning" | "error" | "ai" | "default";
  title?: string;
  subtitle?: string;
  showCopy?: boolean;
  showDownload?: boolean;
  downloadFilename?: string;
  className?: string;
  actions?: React.ReactNode;
  badge?: string;
  maxHeight?: string;
}

const typeStyles = {
  success: {
    card: "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30",
    icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
  },
  info: {
    card: "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30",
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  },
  warning: {
    card: "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30",
    icon: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
  },
  error: {
    card: "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/30 dark:to-rose-950/30",
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  },
  ai: {
    card: "border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30",
    icon: <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
  },
  default: {
    card: "border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/30",
    icon: <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />,
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
  }
};

export function OutputDisplay({
  content,
  type = "default",
  title,
  subtitle,
  showCopy = true,
  showDownload = false,
  downloadFilename,
  className,
  actions,
  badge,
  maxHeight = "600px"
}: OutputDisplayProps) {
  const style = typeStyles[type];

  const handleCopy = () => {
    const textContent = typeof content === "string" ? content : "";
    navigator.clipboard.writeText(textContent);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const textContent = typeof content === "string" ? content : "";
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename || `output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  return (
    <Card className={cn(style.card, "shadow-lg", className)}>
      <CardContent className="p-0">
        {/* Header */}
        {(title || badge || showCopy || showDownload || actions) && (
          <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {style.icon}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-semibold text-sm leading-tight truncate">
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-xs text-muted-foreground leading-snug truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {badge && (
                <Badge variant="secondary" className={cn("text-xs", style.badge)}>
                  {badge}
                </Badge>
              )}

              {showCopy && typeof content === "string" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}

              {showDownload && typeof content === "string" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 px-2"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}

              {actions}
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
          style={{ maxHeight }}
        >
          {typeof content === "string" ? (
            <FormattedContent content={content} />
          ) : (
            content
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FormattedContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 leading-relaxed">
      {content.split('\n').map((line, i) => {
        // Empty lines
        if (!line.trim()) return <div key={i} className="h-3" />;

        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 leading-tight">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-5 mb-2 leading-tight">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 leading-tight">{line.slice(4)}</h3>;
        }

        // Bullet lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <li key={i} className="ml-6 mb-1 leading-snug list-disc">
              {renderInlineFormatting(line.replace(/^[\s-•]+/, ''))}
            </li>
          );
        }

        // Numbered lists
        if (line.match(/^\d+\. /)) {
          return (
            <li key={i} className="ml-6 mb-1 leading-snug list-decimal">
              {renderInlineFormatting(line.replace(/^\d+\. /, ''))}
            </li>
          );
        }

        // Horizontal rules
        if (line === '---' || line === '___') {
          return <hr key={i} className="my-4 border-current/20" />;
        }

        // Regular paragraph
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string) {
  // Handle **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
