import { Age } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/ages`

const getAges = async (): Promise<Age[]> => {
    const res = await fetch(URL);
    return res.json();
}

export default getAges;