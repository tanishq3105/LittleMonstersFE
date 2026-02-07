import { create } from "zustand";
import { Product, CartItem } from "@/types";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { toast } from "react-hot-toast";

interface CartStore {
  items: CartItem[];
  addItem: (data: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  removeAll: () => void;
  getTotalItems: () => number;
}

// Helper to migrate old cart format to new format
const migrateCartData = (items: any[]): CartItem[] => {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map((item) => {
      // Check if item is already in new format (has product property)
      if (item.product && item.quantity !== undefined) {
        return item as CartItem;
      }
      // Old format: item is just a Product, convert to new format
      if (item.id) {
        return { product: item as Product, quantity: 1 };
      }
      return null;
    })
    .filter(Boolean) as CartItem[];
};

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (data: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product?.id === data.id
        );

        if (existingItem) {
          // Increment quantity if item already exists
          set({
            items: currentItems.map((item) =>
              item.product?.id === data.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
          toast.success("Item added to cart.");
          return;
        }

        set({ items: [...get().items, { product: data, quantity: 1 }] });
        toast.success("Item added to cart.");
      },
      removeItem: (id: string) => {
        set({
          items: [...get().items.filter((item) => item.product?.id !== id)],
        });
      },
      updateQuantity: (id: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product?.id === id ? { ...item, quantity } : item
          ),
        });
      },
      incrementQuantity: (id: string) => {
        set({
          items: get().items.map((item) =>
            item.product?.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      },
      decrementQuantity: (id: string) => {
        const item = get().items.find((item) => item.product?.id === id);
        if (item && item.quantity <= 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product?.id === id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        });
      },
      removeAll: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Migrate old cart format to new format on load
        if (state && state.items) {
          state.items = migrateCartData(state.items);
        }
      },
    }
  )
);

export default useCart;
