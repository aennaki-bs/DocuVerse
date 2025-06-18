import React from "react";
import { ButtonShowcase } from "@/components/ui/button-showcase";
import { MainNavbar } from "@/components/navigation/MainNavbar";

export default function ButtonShowcasePage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <MainNavbar />
      <div className="container mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-4">
            DocuVerse UI Componentsdd
          </h1>
          <p className="text-gray-400 max-w-3xl">
            This page showcases the enhanced UI components available in the
            DocuVerse application. These components provide a consistent, modern
            look and feel while offering advanced animations and interactions
            for an improved user experience.
          </p>
        </div>

        <div className="bg-[#161b22] rounded-lg border border-gray-800 p-8 shadow-xl mb-8">
          <ButtonShowcase
            title="Enhanced Buttons"
            description="These buttons provide advanced styling, animations, and interactive elements to improve the user experience."
          />
        </div>
      </div>
    </div>
  );
}
