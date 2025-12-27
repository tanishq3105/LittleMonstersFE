import Image from "next/image";
export default function Footer() {
  return (
    <footer className="flex flex-col items-start gap-12 p-12 w-full bg-[#169C97]">
      <div className="flex items-start justify-between w-full flex-wrap gap-8">
        {/* Brand Section */}
        <div className="flex flex-col items-start gap-6 w-full md:w-auto">
          <div className="flex flex-col items-start gap-6 w-full">
            <div className="w-24 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <Image
                src="https://www.littlemonsters.fun/assets/Logo.png"
                alt="Little Monsters"
                width={120}
                height={48}
                className="h-12 w-auto object-contain bg-[#169C97]"
              />
            </div>
            <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-base leading-6">
              Keeping energetic kids happily busy during travel with
              screen-free, creative activities.
            </p>
          </div>

          {/* Address */}
          <div className="flex flex-col items-start gap-1 w-full">
            <h4 className="font-['Plus_Jakarta_Sans',Helvetica] font-semibold text-white text-sm leading-[21px]">
              Address:
            </h4>
            <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-sm leading-[21px]">
              T-Hub, Raidurgam, Knowledge City Rd, Hyderabad, Telangana 500081
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start gap-3 w-full">
            <h4 className="font-['Plus_Jakarta_Sans',Helvetica] font-semibold text-white text-sm leading-[21px]">
              Contact:
            </h4>
            <div className="flex flex-col items-start w-full">
              <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-sm leading-[21px]">
                +91 8639785747
              </p>
              <a
                href="mailto:contact@littlemonsters.com"
                className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-sm leading-[21px] underline"
              >
                contact@littlemonsters.com
              </a>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex items-start gap-12 flex-wrap">
          {/* Quick Links */}
          <div className="flex flex-col w-[120px] items-start gap-6">
            <h3 className="font-['Plus_Jakarta_Sans',Helvetica] font-bold text-white text-xl leading-[30px]">
              Quick Links
            </h3>
            <div className="flex flex-col items-start gap-4 w-full">
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Features
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Benefits
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Activities
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Reviews
              </a>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col w-[120px] items-start gap-6">
            <h3 className="font-['Plus_Jakarta_Sans',Helvetica] font-bold text-white text-xl leading-[30px]">
              Socials
            </h3>
            <div className="flex flex-col items-start gap-4 w-full">
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                X
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Instagram
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col w-[120px] items-start gap-6">
            <h3 className="font-['Plus_Jakarta_Sans',Helvetica] font-bold text-white text-xl leading-[30px]">
              Support
            </h3>
            <div className="flex flex-col items-start gap-4 w-full">
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                News
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                FAQ
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                About
              </a>
              <a
                href="#"
                className="opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6 hover:opacity-80 transition-opacity"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="shrink-0 h-[1px] bg-[#e6e6e6] w-full"></div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between w-full flex-wrap gap-4">
        <p className="font-['DM_Sans-Regular',_Helvetica] font-normal text-white text-base">
          © 2025, LittleMonsters. All rights reserved.
        </p>
        <div className="flex items-center gap-8">
          <a
            href="#"
            className="inline-flex h-4 items-center opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-sm leading-[21px] hover:opacity-80 transition-opacity"
          >
            English
          </a>
          <a
            href="#"
            className="inline-flex h-4 items-center opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-sm leading-[21px] hover:opacity-80 transition-opacity"
          >
            Privacy
          </a>
          <a
            href="#"
            className="inline-flex h-4 items-center opacity-50 font-['Plus_Jakarta_Sans',Helvetica] font-medium text-white text-sm leading-[21px] hover:opacity-80 transition-opacity"
          >
            Legal
          </a>
        </div>
      </div>
    </footer>
  );
}
