"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Loading from "../my-orders/loading";

function CancelOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");
  const status = searchParams.get("status");
  const customerName = searchParams.get("customerName");

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!orderId || !email) {
      toast.error(
        "Invalid cancellation request. Please try again from your orders page."
      );
      router.push("/my-orders");
    }

    // Check if order is already delivered or cancelled
    if (status === "DELIVERED") {
      toast.error(
        "Cannot cancel a delivered order. Please request a refund instead."
      );
      router.push("/my-orders");
    }

    if (status === "CANCELLED") {
      toast.error("This order has already been cancelled.");
      router.push("/my-orders");
    }
  }, [orderId, email, status, router]);

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason: reason.trim() || "Customer requested cancellation",
          email,
          customerName: customerName || "Customer",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel order");
      }

      setCancelled(true);
      toast.success("Order cancelled successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error cancelling order. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || !email) {
    return <Loading />;
  }

  if (cancelled) {
    return (
      <Container>
        <div className="py-16 sm:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Cancelled
            </h1>
            <p className="text-gray-600 mb-6">
              Your order #{orderNumber || orderId?.slice(0, 8)} has been
              cancelled successfully. If you made an online payment, the refund
              will be processed within 5-7 business days.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/my-orders")}
                className="w-full"
              >
                Back to My Orders
              </Button>
              <button
                onClick={() => router.push("/")}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-16 sm:py-24">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Cancel Order
            </h1>
            <p className="mt-2 text-gray-600">
              Order #{orderNumber || orderId?.slice(0, 8)}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Are you sure you want to cancel this order?
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    This action cannot be undone. If you made an online payment,
                    the refund will be processed within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for cancellation (optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/my-orders")}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                Your order will be cancelled immediately
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                For online payments, refunds are processed within 5-7 business
                days
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                You will receive a confirmation email
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function CancelOrderPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CancelOrderContent />
    </Suspense>
  );
}
