import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Aceternity's class-merge helper: conditional classes + Tailwind conflict resolution.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
