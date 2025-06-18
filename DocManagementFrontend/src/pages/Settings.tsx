import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Palette,
  Settings as SettingsIcon,
  Check,
  User,
  Monitor,
} from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLayout } from "@/components/layout/PageLayout";

// Predefined background options
const backgroundOptions = [
  {
    id: "default",
    name: "backgrounds.default",
    url: "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
    preview:
      "https://www.tigernix.com/wp-content/uploads/2024/01/why-singapore-needs-automation-erp-tigernix-singapore.jpg",
    description: "backgrounds.defaultDescription",
  },
  {
    id: "modern-office",
    name: "backgrounds.modernOffice",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    description: "backgrounds.modernOfficeDescription",
  },
  {
    id: "minimal-gradient",
    name: "backgrounds.minimalGradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
    preview:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
    description: "backgrounds.minimalGradientDescription",
  },
];

const Settings = () => {
  const {
    theme: settingsTheme,
    setTheme,
    language,
    setLanguage,
  } = useSettings();
  const { theme } = useTheme(); // Get current theme from ThemeContext
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, tWithParams } = useTranslation();

  // Background Settings
  const [selectedBackground, setSelectedBackground] = useState(() => {
    return localStorage.getItem("selectedBackground") || "default";
  });

  const handleLanguageChange = (value: "en" | "fr" | "es") => {
    setLanguage(value);
    toast.success(t("settings.languageUpdated"));
  };

  const handleBackgroundChange = (backgroundId: string) => {
    const background = backgroundOptions.find((bg) => bg.id === backgroundId);
    if (background) {
      setSelectedBackground(backgroundId);
      localStorage.setItem("selectedBackground", backgroundId);

      // Apply the background
      document.body.style.backgroundImage = `url(${background.url})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";

      // Dispatch custom event to notify Layout component
      window.dispatchEvent(new CustomEvent("backgroundChanged"));

      toast.success(`Background changed to ${background.name}`);
    }
  };

  // Apply selected background on component mount
  useEffect(() => {
    const background = backgroundOptions.find(
      (bg) => bg.id === selectedBackground
    );
    if (background) {
      document.body.style.backgroundImage = `url(${background.url})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }
  }, [selectedBackground]);

  // Debug theme changes
  useEffect(() => {
    console.log("Theme changed:", theme);
  }, [theme]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      key={theme.variant}
      className="h-full overflow-auto bg-background/10 backdrop-blur-sm p-6"
      style={{ minHeight: "100%" }}
    >
      {/* Professional Header */}
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
        icon={<SettingsIcon className="h-6 w-6 text-primary" />}
        className="mb-8 p-6 rounded-2xl bg-card/5 backdrop-blur-lg border border-white/5 shadow-xl"
      />

      {/* Main Content */}
      <motion.div
        key={`content-${theme.variant}-${theme.mode}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Professional Theme Settings */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <DashboardCard
              title={t("settings.themeSelection")}
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary border-primary/20 backdrop-blur-sm"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  {t("settings.enhanced")}
                </Badge>
              }
              className="h-full bg-card/5 backdrop-blur-xl border-white/5 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-foreground/80 text-sm">
                    {t("settings.themeDescription")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/theme-showcase")}
                      className="text-xs bg-primary/5 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Preview Themes
                    </Button>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/30 backdrop-blur-sm"
                    >
                      Active Theme
                    </Badge>
                  </div>
                </div>

                <ThemeSelector />
              </div>
            </DashboardCard>
          </motion.div>

          {/* Professional Language Settings */}
          <motion.div variants={itemVariants}>
            <DashboardCard
              title={t("settings.languageAndRegion")}
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-green-500/15 text-green-400 border-green-500/20 backdrop-blur-sm"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  {t("settings.global")}
                </Badge>
              }
              className="h-full bg-card/5 backdrop-blur-xl border-white/5 shadow-2xl"
            >
              <div className="space-y-6">
                <p className="text-foreground/80 text-sm">
                  {t("settings.selectLanguageDescription")}
                </p>

                <div className="space-y-4">
                  <Label className="text-foreground font-semibold">
                    {t("settings.displayLanguage")}
                  </Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="bg-background/10 backdrop-blur-sm border-white/10 text-foreground h-12 hover:bg-background/20 transition-all">
                      <SelectValue placeholder={t("settings.selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/80 backdrop-blur-xl border-white/10">
                      <SelectItem
                        value="en"
                        className="text-foreground focus:bg-accent/50 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="fr"
                        className="text-foreground focus:bg-accent/50 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇫🇷</span>
                          <span>Français</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="es"
                        className="text-foreground focus:bg-accent/50 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🇪🇸</span>
                          <span>Español</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Professional Background Settings - Full Width */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <DashboardCard
              title={t("settings.backgroundSelection")}
              headerAction={
                <Badge
                  variant="secondary"
                  className="bg-purple-500/15 text-purple-400 border-purple-500/20 backdrop-blur-sm"
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  {t("settings.themes")}
                </Badge>
              }
              className="bg-card/5 backdrop-blur-xl border-white/5 shadow-2xl"
            >
              <div className="space-y-8">
                <p className="text-foreground/80">
                  {t("settings.backgroundDescription")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {backgroundOptions.map((background) => (
                    <motion.div
                      key={background.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                    >
                      <input
                        type="radio"
                        id={background.id}
                        name="background"
                        value={background.id}
                        checked={selectedBackground === background.id}
                        onChange={() => handleBackgroundChange(background.id)}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor={background.id}
                        className="block cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/10 peer-checked:border-primary peer-checked:ring-4 peer-checked:ring-primary/20 transition-all hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/10 backdrop-blur-sm">
                          <img
                            src={background.preview}
                            alt={background.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Glass Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity backdrop-blur-[1px]"></div>

                          {/* Selected Indicator */}
                          {selectedBackground === background.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3"
                            >
                              <div className="bg-primary/80 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            </motion.div>
                          )}

                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="bg-black/20 backdrop-blur-md rounded-lg p-3 border border-white/5">
                              <h3 className="text-white font-bold text-lg mb-1">
                                {background.name}
                              </h3>
                              <p className="text-white/80 text-sm">
                                {background.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
