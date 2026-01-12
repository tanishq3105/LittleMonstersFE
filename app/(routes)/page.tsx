import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import getCategory from "@/actions/get-category";

export const revalidate = 300; // Cache for 5 minutes

const HomePage = async () => {
  const [category, products] = await Promise.all([
    getCategory("0e1457c0-265d-4406-83f6-9c1a781ed5e0"),
    getProducts({ isFeatured: true }),
  ]);
  return (
    <Container>
      <div className="pb-10 space-y-10">
        {/* <Billboard data={category?.billboard} /> */}
        <div className="flex flex-col px-4 gap-y-8 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
