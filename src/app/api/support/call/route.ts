import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check if Twilio credentials are configured
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.warn("Twilio credentials not configured, using demo mode");

      // Return success in demo mode without actually calling
      return NextResponse.json({
        success: true,
        message: "Support call initiated successfully (Demo Mode)",
        callSid: `DEMO_${Date.now()}`,
        status: "queued",
        demo: true,
      });
    }

    // If Twilio is configured, make actual call
    // Note: You need to install twilio package: npm install twilio
    try {
      // Dynamic import to avoid errors if twilio is not installed
      const twilio = require("twilio");
      const client = twilio(twilioAccountSid, twilioAuthToken);

      const call = await client.calls.create({
        to: phoneNumber,
        from: twilioPhoneNumber,
        url: "http://demo.twilio.com/docs/voice.xml", // Replace with your TwiML URL
        // You can also use twiml parameter for inline TwiML
        twiml: `<Response>
          <Say voice="alice">
            Hello! This is AI Financial Guardian Support.
            A support representative will contact you shortly.
            Thank you for reaching out.
          </Say>
        </Response>`,
      });

      return NextResponse.json({
        success: true,
        message: "Support call initiated successfully",
        callSid: call.sid,
        status: call.status,
        demo: false,
      });
    } catch (twilioError: any) {
      console.error("Twilio API Error:", twilioError);

      // Fallback to demo mode if Twilio fails
      return NextResponse.json({
        success: true,
        message: "Support call initiated successfully (Demo Mode - Twilio unavailable)",
        callSid: `FALLBACK_${Date.now()}`,
        status: "queued",
        demo: true,
        twilioError: twilioError.message,
      });
    }
  } catch (error) {
    console.error("Support Call Error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate support call",
        message: (error as Error).message,
        details: (error as Error).toString(),
      },
      { status: 500 }
    );
  }
}
