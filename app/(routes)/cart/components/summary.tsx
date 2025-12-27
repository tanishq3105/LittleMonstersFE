"use client";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

const Summary = () => {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mounted, setMounted] = useState(false);
  const rzpRef = useRef<any>(null);

  // Get store ID from environment or context
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || "";
  const adminUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const totalPrice = items.reduce(
    (total, item) => total + Number(item.price),
    0
  );

  // Load Razorpay script
  useEffect(() => {
    setMounted(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      // Script loaded successfully
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const onCheckout = async () => {
    // Validate inputs
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order on admin backend
      const checkoutItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
      }));

      const createOrderResponse = await fetch(`${adminUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          items: checkoutItems,
          phone,
          address,
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

      // Step 2: Open Razorpay checkout with handler
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amountInPaise, // Amount in paise
        currency: "INR",
        name: "Little Monsters",
        description: "Purchase items",
        order_id: order.razorpayOrderId, // Razorpay order ID
        prefill: {
          contact: phone,
        },
        handler: async (response: any) => {
          // Step 3: Verify payment on admin backend
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
                orderId: order.id, // Your database order ID
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success("Payment completed successfully!");
              removeAll();
              // Reset form
              setPhone("");
              setAddress("");
              // Redirect to success page or home
              router.push(
                `/success?totalPrice=${totalPrice}&transactionId=${
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
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="px-4 py-6 mt-16 rounded-lg bg-gray-50 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

      {/* Contact Details Form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Delivery Address
          </label>
          <textarea
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      {/* Order Total */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-base font-medium text-gray-400">Order Total</div>
          <Currency value={totalPrice} />
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        disabled={items.length === 0 || loading || !phone || !address}
        className="w-full mt-6"
        onClick={onCheckout}
      >
        {loading ? "Processing..." : "Checkout"}
      </Button>

      {/* Cart Info */}
      {items.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">Your cart is empty</p>
      )}
    </div>
  );
};

export default Summary;
