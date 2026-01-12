"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import Loader from "@/components/loader";
import { toast } from "react-hot-toast";
import useCart from "@/hooks/use-cart";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  items: OrderItem[];
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryMethod: "online" | "cod";
  totalPrice: number;
}

const ConfirmOrderPage = () => {
  const router = useRouter();
  const removeAll = useCart((state) => state.removeAll);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const rzpRef = useRef<any>(null);

  // Get store ID from environment
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || "";
  const adminUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    setIsMounted(true);
    // Retrieve order details from localStorage
    const savedOrder = localStorage.getItem("pendingOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        setOrderDetails(parsed);
      } catch (error) {
        console.error("Failed to parse order details:", error);
        toast.error("Failed to load order details");
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      // Script loaded successfully
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [router]);

  const handleConfirm = async () => {
    if (!orderDetails) return;

    setLoading(true);

    try {
      const checkoutItems = orderDetails.items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Handle Cash on Delivery - create order directly
      if (orderDetails.deliveryMethod === "cod") {
        const createOrderResponse = await fetch(`${adminUrl}/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId,
            items: checkoutItems,
            name: orderDetails.name,
            email: orderDetails.email,
            phone: orderDetails.phone,
            address: orderDetails.address,
            paymentMethod: "cod",
          }),
        });

        if (!createOrderResponse.ok) {
          throw new Error("Failed to create order");
        }

        const orderData = await createOrderResponse.json();

        if (!orderData.success) {
          throw new Error(orderData.error || "Failed to create order");
        }

        toast.success("Order placed successfully!");
        removeAll();
        localStorage.removeItem("pendingOrder");
        router.push(
          `/success?totalPrice=${orderDetails.totalPrice}&transactionId=COD-${
            orderData.order.id
          }&dateTime=${new Date().toISOString()}`
        );
        return;
      }

      // Handle Online Payment
      const createOrderResponse = await fetch(`${adminUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          items: checkoutItems,
          name: orderDetails.name,
          email: orderDetails.email,
          phone: orderDetails.phone,
          address: orderDetails.address,
        }),
      });

      if (!createOrderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await createOrderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { order } = orderData;

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amountInPaise,
        currency: "INR",
        name: "Little Monsters",
        description: "Purchase items",
        order_id: order.razorpayOrderId,
        prefill: {
          contact: orderDetails.phone,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(`${adminUrl}/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success("Payment completed successfully!");
              removeAll();
              localStorage.removeItem("pendingOrder");
              router.push(
                `/success?totalPrice=${orderDetails.totalPrice}&transactionId=${
                  response.razorpay_payment_id
                }&dateTime=${new Date().toISOString()}`
              );
            } else {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
            router.push("/failure");
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
        theme: {
          color: "#3399cc",
        },
      };

      rzpRef.current = new window.Razorpay(options);
      rzpRef.current.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process order"
      );
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push("/cart");
  };

  if (!isMounted) {
    return <Loader />;
  }

  if (!orderDetails) {
    return <Loader />;
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black">Confirm Your Order</h1>

          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
            {/* Order Items */}
            <div className="lg:col-span-7">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-4 border-b border-gray-200"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity} × <Currency value={item.price} />
                        </div>
                      </div>
                      <Currency value={item.price * item.quantity} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Delivery Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Full Name
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {orderDetails.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {orderDetails.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {orderDetails.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Delivery Address
                    </p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                      {orderDetails.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Delivery Method
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {orderDetails.deliveryMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="px-4 py-6 rounded-lg bg-gray-50 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>

                {/* Items Count */}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Items (
                      {orderDetails.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}
                      )
                    </span>
                    <Currency value={orderDetails.totalPrice} />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-base font-medium text-gray-900">
                      Total
                    </div>
                    <Currency value={orderDetails.totalPrice} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm & Place Order"}
                  </Button>

                  <button
                    className="w-full px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    onClick={handleEdit}
                    disabled={loading}
                  >
                    Edit Order
                  </button>
                </div>

                {/* Payment Method Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-900">
                    {orderDetails.deliveryMethod === "cod"
                      ? "💵 You will pay cash upon delivery"
                      : "💳 You will be redirected to the payment gateway"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ConfirmOrderPage;
