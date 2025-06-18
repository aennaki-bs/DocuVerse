import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges tailwind classes and cleans them up
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
