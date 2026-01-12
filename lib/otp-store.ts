// Shared OTP store - used by both send-otp and verify-otp endpoints
// Using globalThis to persist the store across hot module reloads and API route invocations

type OtpData = { code: string; expiresAt: number; name?: string };

declare global {
    var __otpStore: Map<string, OtpData> | undefined;
}

// Use global store to persist across module reloads in development
if (!globalThis.__otpStore) {
    globalThis.__otpStore = new Map<string, OtpData>();
}

export const otpStore: Map<string, OtpData> = globalThis.__otpStore;
