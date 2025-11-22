import React from "react";

interface FormattedTextProps {
    content: string;
    className?: string;
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
    return (
        <div className={`space-y-1 ${className}`}>
            {content.split('\n').map((line, i) => {
                // Handle empty lines as spacers
                if (!line.trim()) return <div key={i} className="h-2" />;

                // Handle bullet points
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');

                // Parse bold text: **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);

                return (
                    <p key={i} className={`min-h-[1.2em] ${isBullet ? 'pl-4' : ''}`}>
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
                    </p>
                );
            })}
        </div>
    );
}
