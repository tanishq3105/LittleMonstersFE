"use client"
import Currency from '@/components/ui/currency';
import IconButton from '@/components/ui/icon-button';
import useCart from '@/hooks/use-cart';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface CartItemProps {
    data: Product;
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {

    const cart = useCart();

    const onRemove = () => {
        cart.removeItem(data.id);
    }

    return (
        

<li className='flex py-6 border-b'>
  <div className='relative w-24 h-24 overflow-hidden rounded-md sm:h-48 sm:w-48'>
    <Image fill src={data.images[0].url} alt="" className='object-cover object-center' />
  </div>

  <div className='flex flex-col justify-between flex-1 ml-4 sm:ml-6'>
    
    <div className='flex justify-between items-start w-full'>
      <p className='text-lg font-semibold text-black pr-6'>{data.name}</p>
      <IconButton onClick={onRemove} icon={<X size={15} />} />
    </div>

    <div className='flex mt-2 text-sm flex-wrap gap-y-2'>
      <p className='text-gray-500 border-l border-gray-200 pl-4 ml-0 mr-4'>{data.size.name}</p>
      <p className='text-gray-500 border-l border-gray-200 pl-4 ml-0 mr-4'>{data.duration.name}</p>
      <p className='text-gray-500 border-l border-gray-200 pl-4 ml-0'>{data.destination.name}</p>
    </div>

    <Currency value={data.price} />
  </div>
</li>


    )
}

export default CartItem;