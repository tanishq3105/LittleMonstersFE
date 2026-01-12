"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Loading from "../my-orders/loading";

function RefundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!orderId || !email) {
      toast.error(
        "Invalid refund request. Please try again from your orders page."
      );
      router.push("/my-orders");
    }
  }, [orderId, email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    if (reason.trim().length < 10) {
      toast.error(
        "Please provide a more detailed reason (at least 10 characters)"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason: reason.trim(),
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit refund request");
      }

      setSubmitted(true);
      toast.success("Refund request submitted successfully!");
    } catch (error: any) {
      toast.error(
        error.message || "Error submitting refund request. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || !email) {
    return <Loading />;
  }

  if (submitted) {
    return (
      <Container>
        <div className="py-16 sm:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Refund Request Submitted
            </h1>
            <p className="text-gray-600 mb-6">
              Your refund request for Order #
              {orderNumber || orderId?.slice(0, 8)} has been submitted
              successfully. We will review your request and notify you via
              email.
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
              Request Refund
            </h1>
            <p className="mt-2 text-gray-600">
              Order #{orderNumber || orderId?.slice(0, 8)}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
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
                <h3 className="text-sm font-medium text-yellow-800">
                  Refund Policy
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Refund requests must be made within 7 days of delivery
                    </li>
                    <li>Products must be unused and in original packaging</li>
                    <li>
                      Refunds are processed within 5-7 business days after
                      approval
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you're requesting a refund..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters. Please be as detailed as possible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <Button disabled={loading} className="flex-1">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}

export default function RefundPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RefundContent />
    </Suspense>
  );
}
