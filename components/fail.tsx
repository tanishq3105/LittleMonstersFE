import { useState, useEffect } from "react";
import { X, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to payment page
          // window.location.href = '/payment';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Failure Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-rose-500 rounded-full p-6">
            <X className="w-16 h-16 text-white stroke-[3]" />
          </div>
        </div>

        {/* Failure Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t process your payment. Please check your payment
          details and try again.
        </p>

        {/* Common Reasons */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6 text-left">
          <h3 className="font-semibold text-amber-900 mb-3 text-sm">
            Common reasons for failure:
          </h3>
          <ul className="space-y-2 text-amber-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Incorrect card details or expired card</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Payment blocked by your bank for security</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Daily transaction limit exceeded</span>
            </li>
          </ul>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-gray-700 text-sm">
            Redirecting to payment page in{" "}
            <span className="font-bold text-gray-900">{countdown}</span>{" "}
            seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-gray-500 text-sm mt-8">
          Still having trouble?{" "}
          <a href="#" className="text-rose-500 hover:text-rose-600 font-medium">
            Contact support
          </a>{" "}
          for assistance
        </p>
      </div>
    </div>
  );
}
