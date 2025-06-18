import React from "react";
import { Check, Palette, Monitor, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme, ThemeVariant, ThemeMode } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  className?: string;
  showModeToggle?: boolean;
  showAutoMode?: boolean;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className,
  showModeToggle = true,
  showAutoMode = true,
  compact = false,
}) => {
  const { theme, setVariant, toggleMode, setAutoMode, availableThemes } =
    useTheme();

  const ThemePreview: React.FC<{
    themeId: ThemeVariant;
    name: string;
    description: string;
    colors: { primary: string; secondary: string; accent: string };
    isSelected: boolean;
    onClick: () => void;
  }> = ({ themeId, name, description, colors, isSelected, onClick }) => (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-xl group bg-background/20 backdrop-blur-sm border-white/20",
        isSelected
          ? "ring-2 ring-primary shadow-xl border-primary/50"
          : "hover:shadow-xl hover:border-white/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Theme Preview Visual */}
        <div className="relative h-20 rounded-lg overflow-hidden mb-3 border border-border">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: colors.secondary }}
          />

          {/* Header Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-6 flex items-center px-2 gap-1"
            style={{ backgroundColor: colors.primary }}
          >
            <div className="w-2 h-2 rounded-full bg-white/80" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Sidebar */}
          <div
            className="absolute left-0 top-6 bottom-0 w-1/3 border-r border-white/10"
            style={{ backgroundColor: `${colors.primary}CC` }}
          >
            <div className="p-2 space-y-1">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: colors.accent }}
              />
              <div className="h-1.5 rounded bg-white/20 w-3/4" />
              <div className="h-1.5 rounded bg-white/15 w-1/2" />
            </div>
          </div>

          {/* Main Content */}
          <div className="absolute right-0 top-6 bottom-0 left-1/3 p-2">
            <div
              className="h-3 rounded mb-2"
              style={{ backgroundColor: colors.accent }}
            />
            <div className="space-y-1">
              <div className="h-1 rounded bg-white/30 w-full" />
              <div className="h-1 rounded bg-white/25 w-4/5" />
              <div className="h-1 rounded bg-white/20 w-3/5" />
            </div>
          </div>

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Theme Info */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{name}</h4>
            {isSelected && (
              <Badge variant="default" className="text-xs px-2 py-0">
                Active
              </Badge>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Select value={theme.variant} onValueChange={setVariant}>
          <SelectTrigger className="w-40">
            <Palette className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableThemes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  {t.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showModeToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="px-3"
          >
            {theme.mode === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mode Controls */}
      {(showModeToggle || showAutoMode) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Monitor className="w-5 h-5" />
            Display Mode
          </h3>

          <div className="grid gap-4">
            {showAutoMode && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 backdrop-blur-sm border border-white/10">
                <div>
                  <Label
                    htmlFor="auto-mode"
                    className="font-medium text-foreground"
                  >
                    Follow System
                  </Label>
                  <p className="text-sm text-foreground/70">
                    Automatically switch between light and dark mode
                  </p>
                </div>
                <Switch
                  id="auto-mode"
                  checked={theme.autoMode}
                  onCheckedChange={setAutoMode}
                />
              </div>
            )}

            {showModeToggle && !theme.autoMode && (
              <div className="flex gap-2">
                <Button
                  variant={theme.mode === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (theme.mode !== "light") {
                      toggleMode();
                    }
                  }}
                  className="flex-1 bg-background/30 backdrop-blur-sm border-white/20 hover:bg-background/50"
                  disabled={theme.autoMode}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme.mode === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (theme.mode !== "dark") {
                      toggleMode();
                    }
                  }}
                  className="flex-1 bg-background/30 backdrop-blur-sm border-white/20 hover:bg-background/50"
                  disabled={theme.autoMode}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Palette className="w-5 h-5" />
          Color Theme
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableThemes.map((t) => (
            <ThemePreview
              key={t.id}
              themeId={t.id}
              name={t.name}
              description={t.description}
              colors={t.colors}
              isSelected={theme.variant === t.id}
              onClick={() => setVariant(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
