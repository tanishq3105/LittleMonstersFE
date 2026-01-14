import { SearchX } from "lucide-react";
import Link from "next/link";

const NoResults = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No products found
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Try adjusting your filters or browse all our activity kits.
      </p>
      <Link
        href="/"
        className="px-5 py-2 bg-teal-500 text-white font-medium rounded-full hover:bg-teal-600 transition-colors"
      >
        View All Products
      </Link>
    </div>
  );
};

export default NoResults;
