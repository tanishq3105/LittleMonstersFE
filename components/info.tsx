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
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
      <div className="flex items-end justify-between mt-3">
        <div className="text-2xl text-gray-900">
          <Currency value={data?.price} />
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Mode of Travel:</h3>
          <div>{data?.size?.value}</div>
        </div>
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Duration:</h3>
          <div>{data?.duration?.value}</div>
        </div>
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Age:</h3>
          <div>{data?.age?.value}</div>
        </div>
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Destination:</h3>
          <div>{data?.destination?.value}</div>
        </div>
      </div>
      <div className="flex items-center mt-10 gap-x-4">
        {quantity === 0 ? (
          <Button
            onClick={onAddToCart}
            className="flex items-center gap-x-2 bg-rose-500 hover:bg-amber-500 cursor-pointer"
          >
            Add To Cart
            <ShoppingCart />
          </Button>
        ) : (
          <div className="flex items-center gap-x-4">
            <div className="flex items-center border-2 border-rose-500 rounded-full overflow-hidden">
              <button
                onClick={onDecrement}
                className="p-3 hover:bg-rose-100 transition-colors"
              >
                <Minus size={20} className="text-rose-500" />
              </button>
              <span className="px-6 py-2 text-lg font-semibold min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={onIncrement}
                className="p-3 hover:bg-rose-100 transition-colors"
              >
                <Plus size={20} className="text-rose-500" />
              </button>
            </div>
            <span className="text-sm text-gray-500">in cart</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Info;
