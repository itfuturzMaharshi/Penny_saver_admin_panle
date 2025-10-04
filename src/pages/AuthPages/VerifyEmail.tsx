import  { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { AuthService } from "../../services/auth/auth.services";
import AuthPageLayout from "./AuthPageLayout";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Invalid verification link");
        setIsLoading(false);
        return;
      }

      try {
        const res = await AuthService.verifyEmail(token);
        if (res.data && res.data.token) {
          localStorage.setItem("token", res.data.token);
          setSuccess(true);
          // Redirect after 2 seconds
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          setError("Verification failed. Please try again.");
        }
      } catch (err: any) {
        setError(err.message || "Verification failed. The link may be invalid or expired.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <>
      <AuthPageLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md p-6">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg">Verifying your email...</p>
              </div>
            ) : success ? (
              <>
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified Successfully!</h1>
                <p className="text-gray-600 mb-6">Your account is now active. Redirecting to sign in...</p>
                <Link
                  to="/signin"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Go to Sign In
                </Link>
              </>
            ) : (
              <>
                <div className="text-red-600 text-6xl mb-4">⚠</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-4">
                  <Link
                    to="/signin"
                    className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-indigo-700 transition-colors"
                  >
                    Back to Sign In
                  </Link>
                  <p className="text-sm text-gray-500">
                    Didn't receive the email?{" "}
                    <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      Resend Verification
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </AuthPageLayout>
    </>
  );
}


