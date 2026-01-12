import { Age } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/ages`;

const getAges = async (): Promise<Age[]> => {
  const res = await fetch(URL, { next: { revalidate: 3600 } });
  return res.json();
};

export default getAges;
