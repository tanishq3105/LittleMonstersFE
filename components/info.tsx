"use client";

import { Product } from "@/types";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import useCart from "@/hooks/use-cart";

interface InfoProps {
  data: Product;
}
const Info: React.FC<InfoProps> = ({ data }) => {
  const cart = useCart();

  // Find if this product is in cart and get its quantity
  const cartItem = cart.items.find((item) => item.product?.id === data.id);
  const quantity = cartItem?.quantity || 0;

  const onAddToCart = () => {
    cart.addItem(data);
  };

  const onIncrement = () => {
    cart.incrementQuantity(data.id);
  };

  const onDecrement = () => {
    cart.decrementQuantity(data.id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100">
      <h1 className="text-3xl font-bold text-teal-700">{data.name}</h1>
      <div className="flex items-end justify-between mt-3">
        <div className="text-2xl font-bold text-amber-500">
          <Currency value={data?.price} />
        </div>
      </div>
      <hr className="my-4 border-teal-100" />
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center gap-x-4 p-3 bg-teal-50 rounded-xl">
          <h3 className="font-semibold text-teal-700">Mode of Travel:</h3>
          <div className="text-gray-700">{data?.size?.value}</div>
        </div>
        <div className="flex items-center gap-x-4 p-3 bg-amber-50 rounded-xl">
          <h3 className="font-semibold text-amber-700">Duration:</h3>
          <div className="text-gray-700">{data?.duration?.value}</div>
        </div>
        <div className="flex items-center gap-x-4 p-3 bg-rose-50 rounded-xl">
          <h3 className="font-semibold text-rose-600">Age:</h3>
          <div className="text-gray-700">{data?.age?.value}</div>
        </div>
        <div className="flex items-center gap-x-4 p-3 bg-teal-50 rounded-xl">
          <h3 className="font-semibold text-teal-700">Destination:</h3>
          <div className="text-gray-700">{data?.destination?.value}</div>
        </div>
      </div>
      <div className="flex items-center mt-8 gap-x-4">
        {quantity === 0 ? (
          <Button
            onClick={onAddToCart}
            className="flex items-center gap-x-2 bg-teal-500 hover:bg-amber-500 cursor-pointer"
          >
            Add To Cart
            <ShoppingCart />
          </Button>
        ) : (
          <div className="flex items-center gap-x-4">
            <div className="flex items-center border-2 border-teal-500 rounded-full overflow-hidden">
              <button
                onClick={onDecrement}
                className="p-3 hover:bg-teal-50 transition-colors"
              >
                <Minus size={20} className="text-teal-600" />
              </button>
              <span className="px-6 py-2 text-lg font-bold min-w-[60px] text-center text-teal-700">
                {quantity}
              </span>
              <button
                onClick={onIncrement}
                className="p-3 hover:bg-teal-50 transition-colors"
              >
                <Plus size={20} className="text-teal-600" />
              </button>
            </div>
            <span className="text-sm font-medium text-teal-600">in cart</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Info;
