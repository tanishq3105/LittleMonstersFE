import { Duration } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/durations`

const getDurations = async (): Promise<Duration[]> => {
    const res = await fetch(URL);
    return res.json();
}

export default getDurations;