"use client";

import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Age, Destination, Duration, Size } from "@/types";
import qs from "query-string";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  data: (Size | Age | Duration | Destination)[];
  name: string;
  valueKey: string;
}

const Filter: React.FC<FilterProps> = ({ data, name, valueKey }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedValue = searchParams.get(valueKey);
  const onClick = (id: string) => {
    const current = qs.parse(searchParams.toString());
    const query = { ...current, [valueKey]: id };

    if (current[valueKey] === id) {
      query[valueKey] = null;
    }

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true }
    );

    router.push(url);
  };
  const colors = ["bg-rose-500", "bg-amber-400", "bg-teal-500", "bg-blue-500"];
  const hoverColors = [
    "hover:bg-rose-500",
    "hover:bg-amber-400",
    "hover:bg-teal-500",
    "hover:bg-blue-500",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomHoverColor =
    hoverColors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold">{name}</h3>
      <hr className="my-4" />
      <div className="flex flex-wrap gap-2">
        {data.map((filter) => (
          <div key={filter.id} className="flex items-center">
            <Button
              className={cn(
                "rounded-md text-sm text-black hover:text-white p-2 border border-gray-300 bg-white",
                randomHoverColor,
                selectedValue === filter.id && `${randomColor} text-white`
              )}
              onClick={() => onClick(filter.id)}
            >
              {filter.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
