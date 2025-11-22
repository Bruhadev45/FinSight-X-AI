"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { renderSafe } from "@/lib/utils/renderSafe";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatInterfaceProps {
  companyId?: string;
  companyName?: string;
}

export const ChatInterface = ({ companyId, companyName }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: companyId
        ? `👋 Hello! I'm your AI Financial Assistant for ${companyName}. I can help you analyze documents, provide insights, answer compliance questions, and offer recommendations specific to this company. What would you like to know?`
        : "👋 Hello! I'm your AI Financial Assistant. I can help you analyze documents, provide insights, answer compliance questions, and offer recommendations. What would you like to know?",
      timestamp: new Date(),
      suggestions: companyId
        ? [
          `Show ${companyName}'s high-risk documents`,
          `Analyze ${companyName}'s compliance status`,
          `What are ${companyName}'s current alerts?`,
          `Show financial trends for ${companyName}`
        ]
        : [
          "What are the latest high-risk documents?",
          "Show me compliance issues",
          "Analyze fraud patterns",
          "What are the current alerts?"
        ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          companyId,
          companyName
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const FormattedMessage = ({ content }: { content: string }) => {
    return (
      <div className="space-y-1">
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
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950 flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          AI Financial Assistant
          {companyName && (
            <span className="text-sm font-normal text-gray-500">for {companyName}</span>
          )}
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-purple-600 text-white"
                  }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"
                  } flex flex-col gap-2`}
              >
                <div
                  className={`rounded-lg p-3 ${message.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                >
                  <FormattedMessage content={message.content} />
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-xs h-7 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950"
                        disabled={isLoading}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Analyzing...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white dark:bg-slate-900 p-4 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                handleSendMessage();
              }
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim() && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={companyName
                ? `Ask about ${companyName}'s documents, risks, compliance...`
                : "Ask about documents, risks, compliance, or get recommendations..."
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Ask me anything about {companyName ? `${companyName}'s` : 'your'} financial documents and analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
};