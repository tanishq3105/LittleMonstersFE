import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';
import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!name || !name.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with email as key
    const emailKey = email.toLowerCase().trim();
    otpStore.set(emailKey, { code: otp, expiresAt, name });
    console.log(`[OTP STORED] Email: "${emailKey}", OTP: ${otp}, Expires: ${new Date(expiresAt).toISOString()}`);
    console.log(`[OTP STORE SIZE] Total entries: ${otpStore.size}`);
    console.log(`[OTP STORE DEBUG] All keys: ${Array.from(otpStore.keys()).join(', ')}`);
    console.log(`[DEMO MODE] OTP for ${email}: ${otp}`);

    // Try to send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Orders Verification',
          html: `
            <h2>Hello ${name},</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });

        console.log(`[EMAIL SENT] OTP sent to ${email}`);
      } catch (emailError) {
        console.error('[EMAIL_ERROR]', emailError);
        // Continue - OTP is still stored even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // For demo/testing - remove in production
      demo_otp: otp,
    });
  } catch (error) {
    console.error('[SEND_OTP_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to send OTP' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
