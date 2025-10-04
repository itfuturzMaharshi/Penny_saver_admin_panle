import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import pennySaverBg from "../../../public/images/penny_saver_bg.jpg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 lg:grid">
          <div 
            className="relative flex items-center justify-center w-full h-full z-1 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${pennySaverBg})`
            }}
          >
            {/* Overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-black/20"></div>
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
