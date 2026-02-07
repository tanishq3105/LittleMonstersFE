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

interface AddressFields {
  houseFlat: string; // Compulsory
  street: string; // Optional
  landmark: string; // Optional
  city: string; // Compulsory
  state: string; // Compulsory
  pincode: string; // Compulsory
}

const Summary = () => {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressFields, setAddressFields] = useState<AddressFields>({
    houseFlat: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
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

  // Helper function to join address fields into a single string
  const joinAddress = (fields: AddressFields): string => {
    const parts = [
      fields.houseFlat,
      fields.street,
      fields.landmark,
      fields.city,
      fields.state,
      fields.pincode,
    ].filter((part) => part.trim() !== "");
    return parts.join(", ");
  };

  // Helper function to parse address string back into fields
  const parseAddress = (address: string): AddressFields => {
    const parts = address.split(", ").map((p) => p.trim());
    // Try to intelligently parse - last part is pincode, second last is state, etc.
    // This is a best-effort parse for when address was stored as a single string
    if (parts.length >= 4) {
      return {
        houseFlat: parts[0] || "",
        street: parts.length > 5 ? parts[1] : "",
        landmark:
          parts.length > 5 ? parts[2] : parts.length > 4 ? parts[1] : "",
        city: parts[parts.length - 3] || "",
        state: parts[parts.length - 2] || "",
        pincode: parts[parts.length - 1] || "",
      };
    }
    return {
      houseFlat: parts[0] || "",
      street: "",
      landmark: "",
      city: parts[1] || "",
      state: parts[2] || "",
      pincode: parts[3] || "",
    };
  };

  useEffect(() => {
    setMounted(true);

    // Load saved order details from localStorage if returning from confirm page
    const savedOrder = localStorage.getItem("pendingOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod);

        // Check if we have structured address fields
        if (parsed.addressFields) {
          setAddressFields(parsed.addressFields);
        } else if (parsed.address) {
          // Parse the old single address string
          setAddressFields(parseAddress(parsed.address));
        }
      } catch (error) {
        console.error("Failed to parse saved order:", error);
      }
    }

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

  const updateAddressField = (field: keyof AddressFields, value: string) => {
    setAddressFields((prev) => ({ ...prev, [field]: value }));
  };

  const onReviewOrder = () => {
    // Validate inputs
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    // Phone validation (10 digits for Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Validate compulsory address fields
    if (!addressFields.houseFlat.trim()) {
      toast.error("Please enter your house/flat/building number");
      return;
    }
    if (!addressFields.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!addressFields.state.trim()) {
      toast.error("Please enter your state");
      return;
    }
    if (!addressFields.pincode.trim()) {
      toast.error("Please enter your pincode");
      return;
    }
    // Pincode validation (6 digits for India)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(addressFields.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Join address fields into single string for DB storage
    const fullAddress = joinAddress(addressFields);

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
      address: fullAddress,
      addressFields, // Store structured fields for editing
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

  const isAddressValid =
    addressFields.houseFlat.trim() &&
    addressFields.city.trim() &&
    addressFields.state.trim() &&
    addressFields.pincode.trim();

  return (
    <div className="px-4 py-6 mt-16 rounded-lg bg-gray-50 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

      {/* Contact Details Form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
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
            Email Address <span className="text-red-500">*</span>
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
            Phone Number <span className="text-red-500">*</span>
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

        {/* Address Fields */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Delivery Address
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">
                House/Flat/Building No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 123, Sunshine Apartments"
                value={addressFields.houseFlat}
                onChange={(e) =>
                  updateAddressField("houseFlat", e.target.value)
                }
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Street/Road <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., MG Road"
                value={addressFields.street}
                onChange={(e) => updateAddressField("street", e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Landmark <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Near City Mall"
                value={addressFields.landmark}
                onChange={(e) => updateAddressField("landmark", e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mumbai"
                  value={addressFields.city}
                  onChange={(e) => updateAddressField("city", e.target.value)}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Maharashtra"
                  value={addressFields.state}
                  onChange={(e) => updateAddressField("state", e.target.value)}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 400001"
                value={addressFields.pincode}
                onChange={(e) => updateAddressField("pincode", e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
                maxLength={6}
              />
            </div>
          </div>
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
          items.length === 0 ||
          loading ||
          !name ||
          !email ||
          !phone ||
          !isAddressValid
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
