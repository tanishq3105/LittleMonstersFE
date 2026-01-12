"use client";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { ShoppingBag, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NavbarActions = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cart = useCart();
  const router = useRouter();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center ml-auto gap-x-4">
      <Button
        className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full"
        onClick={() => router.push("/my-orders")}
      >
        <Package size={20} color="white" />
        <span className="ml-2 text-sm font-medium text-white">My Orders</span>
      </Button>
      <Button
        className="flex items-center px-4 py-2 bg-rose-500 hover:bg-amber-500 rounded-full"
        onClick={() => router.push("/cart")}
      >
        <ShoppingBag size={20} color="white" />
        <span className="ml-2 text-sm font-medium text-white">
          {cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0}
        </span>
      </Button>
    </div>
  );
};

export default NavbarActions;
