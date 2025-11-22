"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Send, Loader2, CheckCircle, Info, RefreshCw, Zap, Activity } from "lucide-react";
import { toast } from "sonner";

interface NotificationResult {
  channel: string;
  status: string;
  messageId?: string;
  error?: string;
  timestamp?: string;
}

export const NotificationCenterPanel = () => {
  const [channel, setChannel] = useState("email");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<NotificationResult[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const channels = [
    { value: "email", label: "Email", icon: <Mail className="h-4 w-4" />, placeholder: "user@example.com" },
    { value: "sms", label: "SMS (Twilio)", icon: <MessageSquare className="h-4 w-4" />, placeholder: "+1234567890" },
    { value: "push", label: "Push Notification", icon: <Bell className="h-4 w-4" />, placeholder: "user_id" },
  ];

  // Real-time notification monitoring with auto-refresh
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const fetchRecentNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=10");
        if (response.ok) {
          const data = await response.json();
          if (data.notifications && Array.isArray(data.notifications)) {
            const formattedResults: NotificationResult[] = data.notifications.map((notif: any) => ({
              channel: notif.channel || "email",
              status: notif.status || "sent",
              messageId: notif.id?.toString(),
              timestamp: notif.createdAt,
            }));
            setResults(formattedResults);
            setLastUpdate(new Date());
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Initial fetch
    fetchRecentNotifications();

    // Set up polling interval for real-time updates (every 5 seconds)
    const interval = setInterval(fetchRecentNotifications, 5000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  const sendNotification = async () => {
    if (!recipient.trim() || !title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate phone number format for SMS
    if (channel === "sms" && !recipient.match(/^\+?[1-9]\d{1,14}$/)) {
      toast.error("Please enter a valid phone number with country code (e.g., +1234567890)");
      return;
    }

    try {
      setSending(true);
      
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: recipient,
          channels: [channel],
          title,
          body: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }
      
      const data = await response.json();
      
      // Add results from the response
      if (data.channels && Array.isArray(data.channels)) {
        const newResults = data.channels.map((ch: any) => ({
          ...ch,
          timestamp: new Date().toISOString()
        }));
        setResults([...newResults, ...results]);
      }
      
      toast.success(`Notification sent via ${channel}!`, {
        description: "Real-time delivery confirmed"
      });
      
      // Clear form
      setTitle("");
      setMessage("");
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error("Notification error:", error);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const getChannelInfo = (channelValue: string) => {
    return channels.find(c => c.value === channelValue);
  };

  const selectedChannel = channels.find(c => c.value === channel);

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-pink-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              Real-Time Notification Center
            </CardTitle>
            <CardDescription>
              Live multi-channel notifications with instant delivery tracking
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRealTimeEnabled ? "default" : "secondary"} className="gap-1">
              <Zap className="h-3 w-3" />
              {isRealTimeEnabled ? "Live" : "Paused"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className="gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRealTimeEnabled ? 'animate-spin' : ''}`} />
              {isRealTimeEnabled ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Status Banner */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Real-Time Monitoring Active
                </span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">
                Last updated: {formatTimestamp(lastUpdate.toISOString())}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Twilio Setup Info */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold mb-1">Multi-Channel Integration</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Email notifications are active. To enable SMS, configure Twilio credentials:
                  <code className="block mt-1 p-1 bg-white dark:bg-slate-900 rounded text-[10px]">
                    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Form */}
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      <div className="flex items-center gap-2">
                        {ch.icon}
                        {ch.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Recipient {channel === "sms" && <span className="text-xs text-gray-500">(Phone with country code)</span>}
              </label>
              <Input
                placeholder={selectedChannel?.placeholder}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Enter your notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={sendNotification} 
              disabled={sending || !recipient.trim() || !title.trim() || !message.trim()}
              className="w-full gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Real-Time Notification
            </Button>
          </CardContent>
        </Card>

        {/* Live Notification Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Live Notification Feed</h4>
            <Badge variant="outline" className="gap-1">
              <RefreshCw className={`h-3 w-3 ${isRealTimeEnabled ? 'animate-spin' : ''}`} />
              {results.length} notifications
            </Badge>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications sent yet</p>
              <p className="text-xs mt-1">Send your first notification above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((result, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelInfo(result.channel)?.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.channel.toUpperCase()}
                            </Badge>
                            {result.status === "sent" && idx < 3 && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                New
                              </Badge>
                            )}
                          </div>
                          {result.messageId && (
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {result.messageId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {result.status === "sent" ? (
                          <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Delivered
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Failed
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(result.timestamp)}
                        </p>
                      </div>
                    </div>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-2">{result.error}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Channel Status Dashboard */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Channel Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {channels.map((ch) => {
                const channelCount = results.filter(r => r.channel === ch.value && r.status === "sent").length;
                return (
                  <div key={ch.value} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      {ch.icon}
                      <span>{ch.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {channelCount}
                      </Badge>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};