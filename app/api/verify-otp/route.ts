import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !email.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!otp || !otp.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'OTP is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const emailKey = email.toLowerCase().trim();
    console.log(`[VERIFY OTP] Looking for email: "${email}"`);
    console.log(`[VERIFY OTP] Email key: "${emailKey}"`);
    console.log(`[VERIFY OTP] Store size: ${otpStore.size}`);
    console.log(`[VERIFY OTP] All keys in store: ${JSON.stringify(Array.from(otpStore.keys()))}`);
    
    const storedOtp = otpStore.get(emailKey);
    console.log(`[VERIFY OTP] Retrieved OTP object:`, storedOtp);
    console.log(`[VERIFY OTP] OTP Found: ${storedOtp ? 'YES' : 'NO'}`);

    if (!storedOtp) {
      return new NextResponse(
        JSON.stringify({ error: 'OTP not found or expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(emailKey);
      return new NextResponse(
        JSON.stringify({ error: 'OTP has expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
    if (storedOtp.code !== otp.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // OTP verified successfully
    const name = storedOtp.name || 'Guest';
    otpStore.delete(emailKey); // Delete OTP after successful verification

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      email: email,
      name: name,
    });
  } catch (error) {
    console.error('[VERIFY_OTP_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to verify OTP' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
