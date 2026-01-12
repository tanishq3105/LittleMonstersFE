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
        {/* <Billboard data={category?.billboard} /> */}
        <div className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
            <MobileFilters
              sizes={sizes}
              ages={ages}
              durations={durations}
              destinations={destinations}
            />

            <div className="hidden mt-5 lg:block">
              <Filter valueKey="sizeId" name="Mode of Travel" data={sizes} />
              <Filter valueKey="ageId" name="Ages" data={ages} />
              <Filter valueKey="durationId" name="Durations" data={durations} />
              <Filter
                valueKey="destinationId"
                name="Destinations"
                data={destinations}
              />
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
