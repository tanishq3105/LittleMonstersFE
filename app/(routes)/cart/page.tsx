"use client";
import { Suspense, useEffect, useState } from "react";
import Container from "@/components/ui/container";
import useCart from "@/hooks/use-cart";
import CartItem from "./components/cart-item";
import Summary from "./components/summary";
import Loader from "@/components/loader";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="bg-white">
        <Container>
          <div className="px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-teal-700">Shopping Cart</h1>
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
              <div className="lg:col-span-7">
                {cart?.items?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-gradient-to-br from-teal-50 to-amber-50 border border-teal-100">
                    <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-teal-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      Your cart is empty
                    </h2>
                    <p className="text-gray-500 text-center mb-6 max-w-sm">
                      Looks like you haven&apos;t added any activity kits yet.
                      Let&apos;s find something fun!
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      Continue Shopping
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <ul>
                    {cart?.items?.map((item) => (
                      <CartItem key={item.product.id} data={item} />
                    ))}
                  </ul>
                )}
              </div>
              {cart?.items?.length > 0 && <Summary />}
            </div>
          </div>
        </Container>
      </div>
    </Suspense>
  );
};

export default CartPage;
