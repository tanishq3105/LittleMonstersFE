"use client";

import { Product } from "@/types";
import Image from "next/image";
import IconButton from "@/components/ui/icon-button";
import { Expand, ShoppingCart, Minus, Plus } from "lucide-react";
import Currency from "@/components/ui/currency";
import { useRouter } from "next/navigation";
import PreviewModal from "./../preview-modal";
import usePreviewModal from "@/hooks/use-preview-modal";
import { MouseEventHandler } from "react";
import useCart from "@/hooks/use-cart";

interface ProductCard {
  data: Product;
}

const ProductCard: React.FC<ProductCard> = ({ data }) => {
  const cart = useCart();
  const previewModal = usePreviewModal();
  const router = useRouter();

  // Find if this product is in cart and get its quantity
  const cartItem = cart.items.find((item) => item.product?.id === data.id);
  const quantity = cartItem?.quantity || 0;

  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  };

  const onPreview: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    previewModal.onOpen(data);
  };

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    cart.addItem(data);
  };

  const onIncrement: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    cart.incrementQuantity(data.id);
  };

  const onDecrement: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    cart.decrementQuantity(data.id);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 space-y-4 bg-white border-2 border-gray-100 cursor-pointer group rounded-2xl shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-200 hover:-translate-y-1"
    >
      {/* Images and Actions */}
      <div className="relative bg-gradient-to-br from-teal-50 to-amber-50 aspect-square rounded-xl overflow-hidden">
        <Image
          fill
          src={data?.images?.[0]?.url || "/logo.png"}
          alt={data?.name || "Product image"}
          className="object-contain p-2"
        />
        <div className="absolute w-full px-6 transition opacity-0 group-hover:opacity-100 bottom-5">
          <div className="flex justify-center gap-x-6">
            <IconButton
              onClick={onPreview}
              icon={<Expand size={20} className="text-white" />}
              className="bg-teal-500"
            />
            {quantity === 0 ? (
              <IconButton
                onClick={onAddToCart}
                icon={<ShoppingCart size={20} className="text-white" />}
                className="bg-amber-400"
              />
            ) : (
              <div
                className="flex items-center bg-white rounded-full shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={onDecrement}
                  className="p-2 hover:bg-gray-100 rounded-l-full transition-colors"
                >
                  <Minus size={16} className="text-gray-700" />
                </button>
                <span className="px-3 text-sm font-semibold min-w-[30px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={onIncrement}
                  className="p-2 hover:bg-gray-100 rounded-r-full transition-colors"
                >
                  <Plus size={16} className="text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {data?.age && (
          <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
            Ages {data.age.name}
          </span>
        )}
        {data?.size && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
            {data.size.name}
          </span>
        )}
      </div>
      {/* Description */}
      <div>
        <p className="text-lg font-semibold">{data?.name}</p>
        <p className="text-sm text-gray-500">{data.category.name}</p>
      </div>
      {/* Price */}
      <div className="flex items-center justify-between">
        <Currency value={data?.price} />
      </div>
    </div>
  );
};

export default ProductCard;
