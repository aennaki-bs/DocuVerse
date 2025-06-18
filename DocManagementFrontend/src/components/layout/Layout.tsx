import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { MainNavbar } from "@/components/navigation/MainNavbar";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/context/SettingsContext";
import ConnectionStatusIndicator from "@/components/shared/ConnectionStatusIndicator";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";

// Predefined background options (same as in Settings)
const backgroundOptions = [
  {
    id: "default",
    name: "Default",
    url: "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
  },
  {
    id: "minimal-gradient",
    name: "Minimal Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
  },
];

export function Layout() {
  const isMobile = useIsMobile();
  const { theme } = useSettings();
  const { theme: themeConfig } = useTheme();
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Get the selected background from localStorage
  useEffect(() => {
    const selectedBackgroundId =
      localStorage.getItem("selectedBackground") || "default";
    const selectedBackground = backgroundOptions.find(
      (bg) => bg.id === selectedBackgroundId
    );

    if (selectedBackground) {
      setBackgroundUrl(selectedBackground.url);
    }
  }, []);

  // Listen for background changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedBackground") {
        const newBackgroundId = e.newValue || "default";
        const newBackground = backgroundOptions.find(
          (bg) => bg.id === newBackgroundId
        );
        if (newBackground) {
          setBackgroundUrl(newBackground.url);
        }
      }
    };

    // Also listen for manual updates (same-window changes)
    const handleCustomEvent = () => {
      const selectedBackgroundId =
        localStorage.getItem("selectedBackground") || "default";
      const selectedBackground = backgroundOptions.find(
        (bg) => bg.id === selectedBackgroundId
      );
      if (selectedBackground) {
        setBackgroundUrl(selectedBackground.url);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("backgroundChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("backgroundChanged", handleCustomEvent);
    };
  }, []);

  // Use Standard theme styling but allow background images
  const isStandardTheme = themeConfig.variant === "standard";

  return (
    <SidebarProvider>
      <div
        className="flex-1 min-h-full w-full flex text-foreground bg-background"
        style={{
          backgroundImage: backgroundUrl
            ? `url('${backgroundUrl}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          height: "100%",
        }}
      >
        {/* Light overlay for better readability */}
        <div className="absolute inset-0 bg-background/20 z-0"></div>

        {/* Main layout structure - elevated above overlay */}
        <div className="relative flex w-full min-h-full z-10">
          {/* Sidebar - clean transparent styling with responsive width */}
          <aside
            className={`h-full ${
              isMobile ? "hidden" : "w-56 sm:w-60 lg:w-64 xl:w-64 flex-shrink-0"
            } ${
              isStandardTheme
                ? "glass-sidebar"
                : "border-r border-border bg-card/95"
            } transition-all duration-300 ease-in-out shadow-lg z-20 overflow-hidden`}
          >
            <SidebarNav />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-full">
            {/* Clean transparent header with responsive sizing */}
            <header
              className={`${
                isStandardTheme
                  ? "glass-header"
                  : isMobile
                  ? "bg-card/95 border-b border-border"
                  : "bg-card/90 border-b border-border"
              } shadow-sm z-30 transition-all duration-300`}
              style={{
                height: "4rem",
                flexShrink: 0,
              }}
            >
              <div className="flex items-center h-full responsive-padding">
                {isMobile && (
                  <SidebarTrigger className="p-2 mr-4 hover:bg-accent rounded-md transition-colors flex-shrink-0" />
                )}

                {/* Main navbar content */}
                <div className="flex-1 min-w-0">
                  <MainNavbar />
                </div>

                {/* Right side items with proper spacing */}
                <div className="flex items-center gap-responsive ml-4 flex-shrink-0">
                  {/* Connection status indicator */}
                  <ConnectionStatusIndicator showRetryButton />
                </div>
              </div>
            </header>

            {/* Main content with clean transparent styling and responsive padding */}
            <main
              className="flex-1 overflow-auto p-4"
              style={{ minHeight: "calc(100vh - 4rem)" }}
            >
              <div
                className={`h-full rounded-lg overflow-auto ${
                  isStandardTheme
                    ? "glass-card"
                    : "border border-border bg-card/85"
                } shadow-lg transition-all duration-300`}
                style={{ minHeight: "100%" }}
              >
                <div className="h-full overflow-auto p-6">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
