"use client";

import Link from "next/link";
import Container from "@/components/ui/container";
import { ArrowLeft, PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="bg-white">
      <Container>
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <PackageX className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-500 text-center max-w-md mb-8">
            Sorry, the product you&apos;re looking for doesn&apos;t exist or has
            been removed from our store.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </Container>
    </div>
  );
}
