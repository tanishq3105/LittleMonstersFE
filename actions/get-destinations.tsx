import { Destination } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/destinations`;

const getDestinations = async (): Promise<Destination[]> => {
  const res = await fetch(URL, { cache: "no-store" });
  return res.json();
};

export default getDestinations;
