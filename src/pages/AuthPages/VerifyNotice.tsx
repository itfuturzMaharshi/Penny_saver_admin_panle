import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import { Link, useLocation } from "react-router";
import { useMemo, useState } from "react";
import { AuthService } from "../../services/auth/auth.services";
import toastHelper from "../../utils/toastHelper";

export default function VerifyNotice() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  }, [location.search]);

  const handleResend = async () => {
    if (!email) {
      toastHelper.warning('Missing email address to resend verification');
      return;
    }
    try {
      setLoading(true);
      await AuthService.resendVerificationEmail(email);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to resend email';
      toastHelper.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Verify Your Email" description="Please verify your email address" />
      <AuthLayout>
        <div className="flex flex-col items-center justify-center w-full py-16">
          <h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">Verify your email</h1>
          <p className="max-w-md text-center text-gray-600 dark:text-gray-400">
            We have sent a verification link to your email. Please click the link to
            verify your account before signing in.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleResend}
              disabled={loading}
              className="px-4 py-2 text-white rounded bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            <Link
              to="/signin"
              className="px-4 py-2 text-white rounded bg-gray-600 hover:bg-gray-700"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}


