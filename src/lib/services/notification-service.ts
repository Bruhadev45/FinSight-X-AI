// Multi-Channel Notification Service
import { Resend } from "resend";
import { Twilio } from "twilio";
import { backOff } from "exponential-backoff";
import { NotificationPayload } from "@/lib/types/enterprise";

export class NotificationService {
  private resend: Resend | null = null;
  private twilio: any = null;
  private maxRetries = 3;
  private baseDelay = 1000;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilio = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendNotification(payload: NotificationPayload) {
    const notificationId = crypto.randomUUID();
    const results: any[] = [];

    for (const channel of payload.channels) {
      try {
        const result = await this.sendWithRetry(channel, payload);
        results.push({
          channel,
          status: "sent",
          ...result,
        });
      } catch (error) {
        results.push({
          channel,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      notificationId,
      channels: results,
      timestamp: new Date().toISOString(),
    };
  }

  private async sendWithRetry(
    channel: "push" | "sms" | "email" | "slack",
    payload: NotificationPayload
  ) {
    return backOff(() => this.sendToChannel(channel, payload), {
      delayFirstAttempt: false,
      jitter: "full",
      startingDelay: this.baseDelay,
      maxDelay: 30000,
      numOfAttempts: this.maxRetries,
      retry: (e: Error, attemptNumber: number) => {
        console.log(`Retry attempt ${attemptNumber} for ${channel}:`, e.message);
        return true;
      },
    });
  }

  private async sendToChannel(
    channel: "push" | "sms" | "email" | "slack",
    payload: NotificationPayload
  ) {
    switch (channel) {
      case "email":
        return this.sendEmail(payload);
      case "sms":
        return this.sendSMS(payload);
      case "push":
        return this.sendPush(payload);
      case "slack":
        return this.sendSlack(payload);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  private async sendEmail(payload: NotificationPayload) {
    if (!this.resend) throw new Error("Resend not initialized");

    // Use userId as email if it contains @, otherwise use mock
    const email = payload.userId.includes("@") 
      ? payload.userId 
      : `user-${payload.userId}@example.com`;

    const { data, error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "alerts@finsight.ai",
      to: email,
      subject: payload.title,
      html: `
        <h2>${payload.title}</h2>
        <p>${payload.body}</p>
        ${
          payload.metadata?.alertType
            ? `<p style="color: #666; font-size: 12px;">Alert Type: ${payload.metadata.alertType}</p>`
            : ""
        }
      `,
    });

    if (error) throw new Error(`Resend error: ${error.message}`);

    return {
      success: true,
      messageId: data?.id,
    };
  }

  private async sendSMS(payload: NotificationPayload) {
    if (!this.twilio) {
      throw new Error("Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to environment variables.");
    }

    // Use userId as phone number (it should contain the phone number from the UI)
    const phoneNumber = payload.userId;

    // Validate phone number format
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error("Invalid phone number format. Use international format with country code (e.g., +1234567890)");
    }

    const smsBody = `${payload.title}: ${payload.body}`.substring(0, 160);

    const message = await this.twilio.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  }

  private async sendPush(payload: NotificationPayload) {
    // Firebase push would go here
    // For now, just return success
    return {
      success: true,
      messageId: crypto.randomUUID(),
    };
  }

  private async sendSlack(payload: NotificationPayload) {
    // Slack webhook would go here
    return {
      success: true,
      messageId: Date.now().toString(),
    };
  }
}

export const notificationService = new NotificationService();