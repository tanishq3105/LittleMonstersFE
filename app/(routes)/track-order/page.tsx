"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Loading from "../my-orders/loading";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const status = searchParams.get("status") || "PENDING";

  const getStatusStep = (currentStatus: string) => {
    const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    return steps.indexOf(currentStatus);
  };

  const statusStep = getStatusStep(status);

  const steps = [
    { name: "Order Placed", description: "Your order has been received" },
    { name: "Processing", description: "Your order is being prepared" },
    { name: "Shipped", description: "Your order is on the way" },
    { name: "Delivered", description: "Your order has been delivered" },
  ];

  return (
    <Container>
      <div className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Track Order
            </h1>
            <p className="mt-2 text-gray-600">
              Order #{orderNumber || orderId?.slice(0, 8)}
            </p>
          </div>

          {status === "CANCELLED" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h2 className="text-xl font-bold text-red-800 mb-2">
                Order Cancelled
              </h2>
              <p className="text-red-600">
                This order has been cancelled. Please contact support for more
                information.
              </p>
            </div>
          ) : (
            <>
              {/* Progress Tracker */}
              <div className="mb-12">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(statusStep / 3) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {steps.map((step, index) => (
                      <div
                        key={step.name}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                            index <= statusStep
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index < statusStep ? (
                            <svg
                              className="w-6 h-6"
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
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <p
                            className={`text-sm font-medium ${
                              index <= statusStep
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {step.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 max-w-[100px]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Third Party Tracking Placeholder */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Carrier Tracking
                </h2>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Third-party tracking information will be available here once
                    your order is shipped.
                  </p>
                  <p className="text-sm text-gray-500">
                    Tracking details will be sent to your email when available.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="mt-8">
            <Button
              onClick={() => router.push("/my-orders")}
              className="w-full"
            >
              Back to My Orders
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackOrderContent />
    </Suspense>
  );
}
