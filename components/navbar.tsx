import Container from "@/components/ui/container";
import Link from "next/link";
import { MainNav } from "@/components";
import getCategories from "@/actions/get-categories";
import NavbarActions from "./navbar-actions";
import Image from "next/image";

const Navbar = async () => {
  const categories = await getCategories();

  return (
    <div className="border-b-2 border-teal-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="relative flex items-center h-18 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex ml-4 lg:ml-0 gap-x-2">
            <Image
              src="https://www.littlemonsters.fun/assets/Logo.png"
              alt="Little Monsters"
              width={120}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <MainNav data={categories || []} />
          <NavbarActions />
        </div>
      </Container>
    </div>
  );
};
export default Navbar;
