"use client";

import { useState } from "react";
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

export default function MyOrdersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [orders, setOrders] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setLoading(true);

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
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);

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

      if (ordersData.ordersCount === 0) {
        toast.success("No orders found");
      } else {
        toast.success(`Found ${ordersData.ordersCount} orders!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error verifying OTP. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !otpSent) {
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>

                  <Button disabled={loading} className="w-full">
                    {loading ? "Sending OTP..." : "Send OTP"}
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
                      disabled={loading}
                    />
                  </div>

                  <Button disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 mt-2"
                    disabled={loading}
                  >
                    Use different email
                  </button>
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
                  onClick={() => {
                    setVerified(false);
                    setName("");
                    setEmail("");
                    setOtpSent(false);
                    setOtp("");
                    setOrders(null);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-900"
                >
                  View orders for different email
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold">{orders.ordersCount}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold">{orders.productsCount}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold">
                      +91 {orders.orders[0].phone}
                    </p>
                    <p className="text-sm text-gray-600">Phone No.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setVerified(false);
                    setName("");
                    setEmail("");
                    setOtpSent(false);
                    setOtp("");
                    setOrders(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  View orders for different email
                </button>

                <div className="space-y-6">
                  {orders.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-lg">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-2 text-right">
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.paymentMethod === "COD"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.paymentMethod === "COD"
                                ? "Cash on Delivery"
                                : "Online Payment"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.isPaid
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.isPaid ? "Paid" : "Pending"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "PROCESSING"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status || "PENDING"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="font-medium mb-3">Order Details:</p>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {order.name || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {order.email || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Address:</span>{" "}
                            {order.address || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t mt-4 pt-4">
                        <p className="font-medium mb-3">Items:</p>
                        <div className="space-y-2">
                          {order.orderItems.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.product.name}
                                </p>
                                <p className="text-gray-500">
                                  Price: ₹{item.product.price} ×{" "}
                                  {item.quantity || 1}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  ₹
                                  {(
                                    item.product.price * (item.quantity || 1)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
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
