"use client";
import Currency from "@/components/ui/currency";
import IconButton from "@/components/ui/icon-button";
import useCart from "@/hooks/use-cart";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  data: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {
  const cart = useCart();

  const onRemove = () => {
    cart.removeItem(data.product.id);
  };

  const onIncrement = () => {
    cart.incrementQuantity(data.product.id);
  };

  const onDecrement = () => {
    cart.decrementQuantity(data.product.id);
  };

  return (
    <li className="flex py-6 border-b">
      <div className="relative w-24 h-24 overflow-hidden rounded-md sm:h-48 sm:w-48">
        <Image
          fill
          src={data.product.images[0].url}
          alt=""
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 ml-4 sm:ml-6">
        <div className="flex justify-between items-start w-full">
          <p className="text-lg font-semibold text-black pr-6">
            {data.product.name}
          </p>
          <IconButton onClick={onRemove} icon={<X size={15} />} />
        </div>

        <div className="flex mt-2 text-sm flex-wrap gap-y-2">
          <p className="text-gray-500 border-l border-gray-200 pl-4 ml-0 mr-4">
            {data.product.size.name}
          </p>
          <p className="text-gray-500 border-l border-gray-200 pl-4 ml-0 mr-4">
            {data.product.duration.name}
          </p>
          <p className="text-gray-500 border-l border-gray-200 pl-4 ml-0">
            {data.product.destination.name}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-x-3 mt-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={onDecrement}
              className="p-2 hover:bg-gray-100 transition-colors rounded-l-md"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="px-4 py-1 text-center min-w-[40px] font-medium">
              {data.quantity}
            </span>
            <button
              onClick={onIncrement}
              className="p-2 hover:bg-gray-100 transition-colors rounded-r-md"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Currency value={data.product.price} />
          <div className="text-sm text-gray-500">
            Subtotal:{" "}
            <Currency value={Number(data.product.price) * data.quantity} />
          </div>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
