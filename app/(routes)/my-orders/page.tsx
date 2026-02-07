"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Loading from "./loading";

interface OrderData {
  ordersCount: number;
  productsCount: number;
  phone: string;
  orders: any[];
  products: any[];
}

interface StoredSession {
  email: string;
  name: string;
  timestamp: number;
}

const SESSION_KEY = "my_orders_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function MyOrdersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [orders, setOrders] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true to check session
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        if (storedSession) {
          const session: StoredSession = JSON.parse(storedSession);
          const now = Date.now();

          // Check if session is still valid (within 24 hours)
          if (now - session.timestamp < SESSION_DURATION) {
            // Session is valid, fetch orders automatically
            setEmail(session.email);
            setName(session.name);
            setVerifiedName(session.name);

            const ordersResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL
              }/orders-by-email?email=${encodeURIComponent(session.email)}`
            );

            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json();
              setOrders(ordersData);
              setVerified(true);
              setSessionChecked(true);
              setLoading(false);
              return;
            }
          } else {
            // Session expired, remove it
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem(SESSION_KEY);
      }

      setSessionChecked(true);
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  // Save session to localStorage
  const saveSession = (email: string, name: string) => {
    const session: StoredSession = {
      email,
      name,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // Clear session and show login form
  const clearSessionAndShowLogin = () => {
    localStorage.removeItem(SESSION_KEY);
    setVerified(false);
    setName("");
    setEmail("");
    setOtpSent(false);
    setOtp("");
    setOrders(null);
    setVerifiedName("");
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      setOtpSent(true);
      setDemoOtp(data.demo_otp);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error("Error sending OTP. Please try again.");
      console.error(error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify OTP");
      }

      const data = await response.json();
      setVerifiedName(data.name);

      // Fetch orders after OTP verification
      const ordersResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/orders-by-email?email=${encodeURIComponent(email.trim())}`
      );

      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }

      const ordersData = await ordersResponse.json();
      setOrders(ordersData);
      setVerified(true);
      setOtpSent(false);
      setOtp("");

      // Save session to localStorage for 24-hour persistence
      saveSession(email.trim(), data.name);

      if (ordersData.ordersCount === 0) {
        toast.success("No orders found");
      } else {
        toast.success(`Found ${ordersData.ordersCount} orders!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error verifying OTP. Please try again.");
      console.error(error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Show loading only while checking session
  if (!sessionChecked) {
    return <Loading />;
  }

  return (
    <Container>
      <div className="py-16 sm:py-24">
        {!verified ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                View My Orders
              </h1>
              <p className="mt-2 text-gray-600">
                Enter your details to access your orders
              </p>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      disabled={sendingOtp}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      disabled={sendingOtp}
                    />
                  </div>

                  <Button disabled={sendingOtp} className="w-full">
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      OTP sent to <strong>{email}</strong>
                    </p>
                    {demoOtp && (
                      <p className="text-xs text-blue-600 mt-2">
                        Demo OTP: <strong>{demoOtp}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                      disabled={verifyingOtp}
                    />
                  </div>

                  <Button disabled={verifyingOtp} className="w-full">
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                      disabled={verifyingOtp || sendingOtp}
                    >
                      Use different email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-sm text-blue-600 hover:text-blue-900"
                      disabled={verifyingOtp || sendingOtp}
                    >
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : null}

        {verified && orders && (
          <div className="mt-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome {verifiedName}!
              </h1>
              <p className="mt-2 text-gray-600">Here are your orders</p>
            </div>

            {orders.ordersCount === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found for {email}</p>
                <button
                  onClick={clearSessionAndShowLogin}
                  className="mt-4 text-blue-600 hover:text-blue-900"
                >
                  Use another email
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {orders.ordersCount}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Total Orders
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-purple-600"
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
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {orders.productsCount}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Total Products
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          +91 {orders.orders[0].phone}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Phone Number
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearSessionAndShowLogin}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Use another email
                </button>

                <div className="space-y-6">
                  {orders.orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Order Header with Gradient */}
                      <div
                        className={`px-6 py-4 ${
                          order.status === "DELIVERED"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50"
                            : order.status === "SHIPPED"
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                            : order.status === "PROCESSING"
                            ? "bg-gradient-to-r from-purple-50 to-violet-50"
                            : order.status === "CANCELLED"
                            ? "bg-gradient-to-r from-red-50 to-rose-50"
                            : "bg-gradient-to-r from-gray-50 to-slate-50"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-100"
                                  : order.status === "PROCESSING"
                                  ? "bg-purple-100"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {order.status === "DELIVERED" ? (
                                <svg
                                  className="w-6 h-6 text-green-600"
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
                              ) : order.status === "SHIPPED" ? (
                                <svg
                                  className="w-6 h-6 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                  />
                                </svg>
                              ) : order.status === "PROCESSING" ? (
                                <svg
                                  className="w-6 h-6 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              ) : order.status === "CANCELLED" ? (
                                <svg
                                  className="w-6 h-6 text-red-600"
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
                              ) : (
                                <svg
                                  className="w-6 h-6 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                  : order.status === "PROCESSING"
                                  ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                                  : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === "DELIVERED"
                                    ? "bg-green-500"
                                    : order.status === "SHIPPED"
                                    ? "bg-blue-500"
                                    : order.status === "PROCESSING"
                                    ? "bg-purple-500"
                                    : order.status === "CANCELLED"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              {order.status || "PENDING"}
                            </span>
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                order.isPaid
                                  ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                              }`}
                            >
                              {order.isPaid ? "✓ Paid" : "⏳ Payment Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Body */}
                      <div className="p-6">
                        {/* Customer & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Customer Details
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {order.name || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {order.email || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <svg
                                  className="w-4 h-4 text-gray-400 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {order.address || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Payment Info
                            </p>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  order.paymentMethod === "COD"
                                    ? "bg-orange-100"
                                    : "bg-blue-100"
                                }`}
                              >
                                {order.paymentMethod === "COD" ? (
                                  <svg
                                    className="w-5 h-5 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-semibold ${
                                    order.paymentMethod === "COD"
                                      ? "text-orange-700"
                                      : "text-blue-700"
                                  }`}
                                >
                                  {order.paymentMethod === "COD"
                                    ? "Cash on Delivery"
                                    : "Online Payment"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.isPaid
                                    ? "Payment completed"
                                    : "Payment pending"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Order Items
                          </p>
                          <div className="space-y-3">
                            {order.orderItems.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-gray-400"
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
                                  <div>
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/product/${item.product.id}`
                                        )
                                      }
                                      className="font-medium text-gray-900 text-left hover:text-blue-600 transition cursor-pointer"
                                    >
                                      {item.product.name}
                                    </button>
                                    <p className="text-sm text-gray-500">
                                      ₹{item.product.price} ×{" "}
                                      {item.quantity || 1}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    ₹
                                    {(
                                      item.product.price * (item.quantity || 1)
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Order Total */}
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                              Order Total
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ₹
                              {order.orderItems
                                .reduce(
                                  (total: number, item: any) =>
                                    total +
                                    item.product.price * (item.quantity || 1),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons - Hide for CANCELLED orders */}
                        {order.status !== "CANCELLED" && (
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap gap-3">
                              {/* For DELIVERED orders: Buy Again and Refund */}
                              {order.status === "DELIVERED" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      // Navigate to the first product in the order
                                      if (order.orderItems.length > 0) {
                                        router.push(
                                          `/product/${order.orderItems[0].product.id}`
                                        );
                                      }
                                    }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                      />
                                    </svg>
                                    Buy Again
                                  </button>
                                  <button
                                    onClick={() => {
                                      const params = new URLSearchParams({
                                        orderId: order.id,
                                        orderNumber: order.id.slice(0, 8),
                                        email: email,
                                        customerName:
                                          verifiedName || order.name || "",
                                      });
                                      router.push(
                                        `/refund?${params.toString()}`
                                      );
                                    }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white border-2 border-red-200 text-red-600 text-sm rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200 inline-flex items-center justify-center gap-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                      />
                                    </svg>
                                    Request Refund
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* For non-delivered orders: Track Order and Cancel */}
                                  <button
                                    onClick={() => {
                                      const params = new URLSearchParams({
                                        orderId: order.id,
                                        orderNumber: order.id.slice(0, 8),
                                        status: order.status || "PENDING",
                                      });
                                      router.push(
                                        `/track-order?${params.toString()}`
                                      );
                                    }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                      />
                                    </svg>
                                    Track Order
                                  </button>
                                  <button
                                    onClick={() => {
                                      const params = new URLSearchParams({
                                        orderId: order.id,
                                        orderNumber: order.id.slice(0, 8),
                                        email: email,
                                        status: order.status || "PENDING",
                                        customerName:
                                          verifiedName || order.name || "",
                                      });
                                      router.push(
                                        `/cancel-order?${params.toString()}`
                                      );
                                    }}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white border-2 border-orange-200 text-orange-600 text-sm rounded-xl font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 inline-flex items-center justify-center gap-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                                    Cancel Order
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
