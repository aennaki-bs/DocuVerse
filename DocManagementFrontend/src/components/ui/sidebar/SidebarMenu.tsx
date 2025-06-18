
import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  SidebarMenuProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

// Item
interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  SidebarMenuItemProps
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} data-sidebar="menu-item" className={className} {...props} />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

// Button
export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, variant = "ghost", size = "default", ...props }, ref) => {
  const { open } = useSidebar();
  const Comp = asChild ? React.Fragment : "button";
  const child = asChild ? React.Children.only(props.children) : null;
  const childProps = asChild && child && React.isValidElement(child) ? child.props : {};

  // If the sidebar is collapsed and we're rendering a button, add a tooltip.
  if (!open && !asChild) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            type="button"
            data-sidebar="menu-button"
            className={cn(
              buttonVariants({ variant, size }),
              "justify-start",
              className
            )}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          {typeof props.children === "string"
            ? props.children
            : props.title || "Menu Item"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-sidebar="menu-button"
      className={
        asChild
          ? undefined
          : cn(
              buttonVariants({ variant, size }),
              "justify-start",
              className
            )
      }
      {...(asChild ? childProps : props)}
    >
      {asChild ? child : props.children}
    </Comp>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";
