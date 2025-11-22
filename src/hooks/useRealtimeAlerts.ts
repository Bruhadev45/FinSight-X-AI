"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Alert {
  id: number;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  triggeredAt: string;
}

interface UseRealtimeAlertsOptions {
  pollInterval?: number; // in milliseconds, default 5000 (5 seconds)
  enableToasts?: boolean;
  enableSound?: boolean;
}

export const useRealtimeAlerts = (options: UseRealtimeAlertsOptions = {}) => {
  const {
    pollInterval = 5000,
    enableToasts = true,
    enableSound = true,
  } = options;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const previousAlertIds = useRef<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for critical alerts
  useEffect(() => {
    if (typeof window !== "undefined" && enableSound) {
      audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZijcIG2m98OScTgwOUKfj8LZjHAU7k9n0yHkpBSh+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBSl+zPLaizsKGGS56+mjUxELTKXh8bllHAU2jdXzxnwqBQ==");
    }
  }, [enableSound]);

  const playAlertSound = useCallback(() => {
    if (audioRef.current && enableSound) {
      audioRef.current.play().catch((err) => {
        console.error("Failed to play alert sound:", err);
      });
    }
  }, [enableSound]);

  const showAlertToast = useCallback((alert: Alert) => {
    if (!enableToasts) return;

    const severityConfig = {
      critical: {
        icon: "🚨",
        duration: 10000,
        className: "border-red-500",
      },
      high: {
        icon: "⚠️",
        duration: 7000,
        className: "border-orange-500",
      },
      medium: {
        icon: "📢",
        duration: 5000,
        className: "border-yellow-500",
      },
      low: {
        icon: "ℹ️",
        duration: 4000,
        className: "border-blue-500",
      },
    };

    const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.low;

    toast.error(`${config.icon} ${alert.title}`, {
      description: alert.description,
      duration: config.duration,
      className: config.className,
      action: {
        label: "View",
        onClick: () => {
          window.dispatchEvent(new CustomEvent("navigate-to-section", { detail: "alerts" }));
        },
      },
    });

    // Play sound for critical and high severity alerts
    if (alert.severity === "critical" || alert.severity === "high") {
      playAlertSound();
    }
  }, [enableToasts, playAlertSound]);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/alerts?status=unread&limit=50");
      if (!response.ok) return;

      const data = await response.json();
      const fetchedAlerts: Alert[] = data.alerts || [];

      // Check for new alerts
      const currentAlertIds = new Set(fetchedAlerts.map((a) => a.id));
      const newAlerts = fetchedAlerts.filter(
        (alert) => !previousAlertIds.current.has(alert.id)
      );

      // Show toasts for new alerts (only if not initial load)
      if (previousAlertIds.current.size > 0 && newAlerts.length > 0) {
        newAlerts.forEach((alert) => {
          showAlertToast(alert);
        });
      }

      // Update state
      setAlerts(fetchedAlerts);
      setUnreadCount(fetchedAlerts.length);
      previousAlertIds.current = currentAlertIds;
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setIsLoading(false);
    }
  }, [showAlertToast]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(fetchAlerts, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollInterval]);

  const markAsRead = useCallback(async (alertId: number) => {
    try {
      await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      
      // Immediately update local state
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      previousAlertIds.current.delete(alertId);
      
      toast.success("Alert marked as read");
    } catch (error) {
      console.error("Error marking alert as read:", error);
      toast.error("Failed to mark alert as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const promises = alerts.map((alert) =>
        fetch("/api/alerts/acknowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertId: alert.id }),
        })
      );
      
      await Promise.all(promises);
      
      setAlerts([]);
      setUnreadCount(0);
      previousAlertIds.current.clear();
      
      toast.success("All alerts marked as read");
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      toast.error("Failed to mark all alerts as read");
    }
  }, [alerts]);

  const refetch = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};
