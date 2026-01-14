import { redirect } from "next/navigation";
import getCategories from "@/actions/get-categories";

export const revalidate = 300; // Cache for 5 minutes

const HomePage = async () => {
  const categories = await getCategories();

  // Redirect to the first category
  if (categories.length > 0) {
    redirect(`/category/${categories[0].id}`);
  }

  return null;
};

export default HomePage;
