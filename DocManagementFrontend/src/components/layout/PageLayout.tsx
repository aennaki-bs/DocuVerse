import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  icon?: LucideIcon;
}

interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: PageAction[];
  children: React.ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  children,
}: PageLayoutProps) {
  return (
    <div
      className="h-full flex flex-col gap-6 max-w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-xl border border-primary/20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/30">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                className={
                  action.variant === "outline"
                    ? "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                    : action.variant === "default"
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl border border-primary/30 hover:border-primary/50 transition-all duration-300"
                    : undefined
                }
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
