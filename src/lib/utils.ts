import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPercentage = (value: number) => {
  if (isNaN(value) || !isFinite(value)) return "0.0";
  return value.toFixed(1);
};