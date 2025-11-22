// Multi-Channel Notification API
import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services/notification-service";
import { NotificationPayload } from "@/lib/types/enterprise";

export async function POST(request: NextRequest) {
  try {
    const payload: NotificationPayload = await request.json();

    if (!payload.userId || !payload.channels?.length || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: "Missing required fields: userId, channels, title, body" },
        { status: 400 }
      );
    }

    const result = await notificationService.sendNotification(payload);

    return NextResponse.json({
      success: true,
      notificationId: result.notificationId,
      channels: result.channels,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
