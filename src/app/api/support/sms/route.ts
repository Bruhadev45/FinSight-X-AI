import { NextRequest, NextResponse } from 'next/server';

// POST /api/support/sms - Send SMS confirmation for support ticket
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, ticketId, subject } = await request.json();

    if (!phoneNumber || !ticketId) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber and ticketId required' },
        { status: 400 }
      );
    }

    // For demo/development: Log the SMS instead of actually sending
    // In production, integrate with Twilio or similar SMS service
    const smsMessage = `✅ Your support ticket #${ticketId} has been received! Subject: "${subject}". We will contact you shortly. - AI Financial Guardian`;

    console.log('📱 SMS would be sent:', {
      to: phoneNumber,
      message: smsMessage,
      ticketId,
    });

    // Uncomment and configure for production Twilio integration:
    /*
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      demo: true, // Indicates this is a demo mode
    });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
