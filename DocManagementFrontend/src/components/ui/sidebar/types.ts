
import * as React from "react";

export interface SidebarContext {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (value: boolean | ((value: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}

export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_ICON = "3.5rem";
export const SIDEBAR_WIDTH_MOBILE = "85%";
export const SIDEBAR_COOKIE_NAME = "sidebar-expanded";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
export const SIDEBAR_KEYBOARD_SHORTCUT = "\\";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "icon" | "offcanvas" | "none";
}

// Add any missing type definitions from the original file
