export const env = {
  baseUrl: (import.meta as any).env?.VITE_BASE_URL || 'http://localhost:3200',
  // Comma-separated paths supported, e.g.: 
  // VITE_RESEND_VERIFICATION_PATH="/api/seller/verify-email/resend,/api/auth/resend-verification"
  resendVerificationPaths: ((import.meta as any).env?.VITE_RESEND_VERIFICATION_PATH || '')
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => !!p),
  // Comma-separated verify paths. Support token placeholder like :token or {token}
  // VITE_VERIFY_EMAIL_PATH="/api/seller/verify-email/:token,/api/auth/verify-email"
  verifyEmailPaths: ((import.meta as any).env?.VITE_VERIFY_EMAIL_PATH || '')
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => !!p),
};


