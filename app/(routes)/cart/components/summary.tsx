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
  quantity: number;
}

const Summary = () => {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"online" | "cod">(
    "online"
  );
  const [mounted, setMounted] = useState(false);
  const rzpRef = useRef<any>(null);

  // Get store ID from environment or context
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || "";
  const adminUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const totalPrice = items.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  );

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

  const onReviewOrder = () => {
    // Validate inputs
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
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

    // Save order details to localStorage
    const orderDetails = {
      items: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
      })),
      name,
      email,
      phone,
      address,
      deliveryMethod,
      totalPrice,
    };

    localStorage.setItem("pendingOrder", JSON.stringify(orderDetails));

    // Navigate to confirmation page
    router.push("/confirm-order");
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
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

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

        <div>
          <label className="text-sm font-medium text-gray-700">
            Delivery Method
          </label>
          <div className="mt-3 space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="online-delivery"
                name="delivery-method"
                value="online"
                checked={deliveryMethod === "online"}
                onChange={() => setDeliveryMethod("online")}
                disabled={loading}
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="online-delivery"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Online Payment Delivery
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="cod"
                name="delivery-method"
                value="cod"
                checked={deliveryMethod === "cod"}
                onChange={() => setDeliveryMethod("cod")}
                disabled={loading}
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="cod"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Cash on Delivery
              </label>
            </div>
          </div>
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
        disabled={
          items.length === 0 || loading || !name || !email || !phone || !address
        }
        className="w-full mt-6"
        onClick={onReviewOrder}
      >
        {loading ? "Processing..." : "Review Order"}
      </Button>

      {/* Cart Info */}
      {items.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">Your cart is empty</p>
      )}
    </div>
  );
};

export default Summary;
