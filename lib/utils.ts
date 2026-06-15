import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const flagImageClass =
  "w-7 h-5 sm:w-8 sm:h-5 object-contain rounded-sm flex-shrink-0"
