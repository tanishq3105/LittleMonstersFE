import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import getCategory from "@/actions/get-category";
import getCategories from "@/actions/get-categories";
import Link from "next/link";
import { Plane, Clock, Sparkles, Package } from "lucide-react";

export const revalidate = 300; // Cache for 5 minutes

const HomePage = async () => {
  const [category, products, categories] = await Promise.all([
    getCategory("0e1457c0-265d-4406-83f6-9c1a781ed5e0"),
    getProducts({ isFeatured: true }),
    getCategories(),
  ]);

  return (
    <Container>
      <div className="pb-10 space-y-10">
        {/* Hero Section */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-8 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-amber-50 border border-teal-100">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-700 text-center">
            Welcome to Little Monsters!
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Screen-free travel activity kits that keep kids entertained for
            hours
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Value Props */}
        <div className="mx-4 sm:mx-6 lg:mx-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-teal-50 border border-teal-100">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
              <Plane className="w-6 h-6 text-teal-600" />
            </div>
            <p className="font-semibold text-teal-700 text-center text-sm">
              Travel Ready
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Compact & portable
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="font-semibold text-amber-700 text-center text-sm">
              Hours of Fun
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Screen-free activities
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-rose-500" />
            </div>
            <p className="font-semibold text-rose-600 text-center text-sm">
              Creative Play
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Learning through fun
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-semibold text-purple-700 text-center text-sm">
              All-Inclusive
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Everything you need
            </p>
          </div>
        </div>

        {/* Featured Products */}
        <div className="flex flex-col px-4 gap-y-8 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
