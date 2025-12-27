"use client";

import { useState, useEffect } from "react";
import { Age, Duration, Destination, Size } from "@/types";
import Button from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Dialog } from "@headlessui/react";
import IconButton from "@/components/ui/icon-button";
import Filter from "./filter";

interface MobileFiltersProps {
  sizes: Size[];
  ages: Age[];
  durations: Duration[];
  destinations: Destination[];
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  sizes,
  ages,
  durations,
  destinations,
}) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure hydration only happens after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  // Don't render Dialog on server
  if (!mounted) {
    return (
      <Button className="flex items-center gap-x-2 lg:hidden" onClick={onOpen}>
        Filters
        <Plus size={20} />
      </Button>
    );
  }

  return (
    <>
      <Button className="flex items-center gap-x-2 lg:hidden" onClick={onOpen}>
        Filters
        <Plus size={20} />
      </Button>
      <Dialog
        open={open}
        as="div"
        className="relative z-40 lg:hidden"
        onClose={onClose}
      >
        {/* Background */}
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        {/* Dialog Position */}
        <div className="fixed inset-0 z-40 flex">
          <Dialog.Panel className="relative flex flex-col w-full h-full max-w-xs py-4 pb-6 ml-auto overflow-y-auto bg-white shadow-xl">
            {/* Close Button */}
            <div className="flex items-center justify-end px-4">
              <IconButton icon={<X size={15} onClick={onClose} />} />
            </div>
            {/* Render the filters */}
            <div className="p-4">
              <Filter valueKey="sizeId" name="Mode" data={sizes} />
              <Filter valueKey="ageId" name="Ages" data={ages} />
              <Filter valueKey="durationId" name="Durations" data={durations} />
              <Filter
                valueKey="destinationId"
                name="Destinations"
                data={destinations}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default MobileFilters;
