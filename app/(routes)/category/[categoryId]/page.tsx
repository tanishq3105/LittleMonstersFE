import getCategory from "@/actions/get-category";
import getProducts from "@/actions/get-products";
import getSizes from "@/actions/get-sizes";
import Billboard from "@/components/billboard";
import Container from "@/components/ui/container";
import Filter from "./components/filter";
import NoResults from "@/components/ui/no-results";
import ProductCard from "@/components/ui/product-card";
import MobileFilters from "./components/mobile-filters";
import getAges from "@/actions/get-ages";
import getDurations from "@/actions/get-durations";
import getDestinations from "@/actions/get-destinations";

export const revalidate = 300; // Cache for 5 minutes

type Params = Promise<{ categoryId: string }>;
type SearchParams = Promise<{
  ageId: string;
  durationId: string;
  destinationId: string;
  sizeId: string;
}>;

const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { categoryId } = await params;
  const { ageId, durationId, destinationId, sizeId } = await searchParams;

  // Run all API calls in parallel for better performance
  const [products, sizes, ages, durations, destinations, category] =
    await Promise.all([
      getProducts({
        categoryId: categoryId,
        ageId: ageId,
        durationId: durationId,
        destinationId: destinationId,
        sizeId: sizeId,
      }),
      getSizes(),
      getAges(),
      getDurations(),
      getDestinations(),
      getCategory(categoryId),
    ]);

  return (
    <div className="bg-white">
      <Container>
        {/* Category Header */}
        {/* <div className="px-4 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
              {category?.name || "Products"}
            </h1>
            <p className="mt-2 text-gray-600">
              {products?.length || 0}{" "}
              {products?.length === 1 ? "product" : "products"} found
            </p>
          </div>
        </div> */}

        <div className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
            <MobileFilters
              sizes={sizes}
              ages={ages}
              durations={durations}
              destinations={destinations}
            />

            <div className="hidden mt-5 lg:block space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4">Filters</h3>
                <Filter valueKey="sizeId" name="Mode of Travel" data={sizes} />
                <Filter valueKey="ageId" name="Ages" data={ages} />
                <Filter
                  valueKey="durationId"
                  name="Durations"
                  data={durations}
                />
                <Filter
                  valueKey="destinationId"
                  name="Destinations"
                  data={destinations}
                />
              </div>
            </div>
            <div className="mt-6 lg:col-span-4 lg:mt-0">
              {products?.length === 0 && <NoResults />}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {products?.map((item) => (
                  <ProductCard key={item.id} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryPage;
