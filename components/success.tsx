import { useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";

export default function PaymentSuccess({
  totalPrice,
  transactionId,
  dateTime,
}: {
  totalPrice: number;
  transactionId: string;
  dateTime: string;
}) {
  const [countdown, setCountdown] = useState(5);

  // Check if this is a COD order
  const isCOD = transactionId?.startsWith("COD-");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to home or dashboard
          window.location.href = "/";
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
        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-green-500 rounded-full p-6">
            <Check className="w-16 h-16 text-white stroke-[3]" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isCOD ? "Order Placed Successfully!" : "Payment Successful!"}
        </h1>
        <p className="text-gray-600 mb-8">
          {isCOD
            ? "Your order has been placed successfully. Please keep the exact amount ready for payment upon delivery. A confirmation email has been sent to your inbox."
            : "Your transaction has been completed successfully. A confirmation email has been sent to your inbox."}
        </p>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
            <span className="text-gray-600">
              {isCOD ? "Amount to Pay" : "Amount Paid"}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {totalPrice}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">
              {isCOD ? "Order ID" : "Transaction ID"}
            </span>
            <span className="text-amber-600 font-mono text-sm">
              {transactionId}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Date & Time</span>
            <span className="text-gray-900 text-sm">{dateTime}</span>
          </div>
          {isCOD && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
              <span className="text-gray-600 text-sm">Payment Method</span>
              <span className="text-orange-600 font-medium text-sm">
                Cash on Delivery
              </span>
            </div>
          )}
        </div>

        {/* COD Info Banner */}
        {isCOD && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-700 text-sm">
              💵 Please pay <strong>₹{totalPrice}</strong> in cash when your
              order is delivered.
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
          <p className="text-rose-700 text-sm">
            Redirecting to dashboard in{" "}
            <span className="font-bold text-rose-600">{countdown}</span>{" "}
            seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-gray-500 text-sm mt-8">
          Need help? Contact our{" "}
          <a href="#" className="text-rose-500 hover:text-rose-600 font-medium">
            support team
          </a>
        </p>
      </div>
    </div>
  );
}
