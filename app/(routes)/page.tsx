import { redirect } from "next/navigation";
import getCategories from "@/actions/get-categories";
import Container from "@/components/ui/container";
import Link from "next/link";

export const revalidate = 300; // Cache for 5 minutes

const HomePage = async () => {
  const categories = await getCategories();

  // Redirect to the first category
  if (categories.length > 0) {
    redirect(`/category/${categories[0].id}`);
  }

  // Show empty state if no categories exist
  return (
    <div className="bg-white">
      <Container>
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-teal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Coming Soon!
          </h1>
          <p className="text-gray-500 text-center max-w-md">
            We&apos;re setting up our store with amazing products. Check back
            soon!
          </p>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
