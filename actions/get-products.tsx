import { Product } from "@/types";
import qs from "query-string";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

interface Query {
  categoryId?: string;
  ageId?: string;
  durationId?: string;
  destinationId?: string;
  sizeId?: string;
  isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      categoryId: query.categoryId,
      sizeId: query.sizeId,
      ageId: query.ageId,
      durationId: query.durationId,
      destinationId: query.destinationId,
      isFeatured: query.isFeatured,
    },
  });
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
};

export default getProducts;
