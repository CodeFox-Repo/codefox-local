import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Check if protocol is http or https
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parses URL from message content marked with [URL:...]
 */
export function parseURLFromMessage(content: string): string | null {
  const urlMatch = content.match(/\[URL:(.*?)\]/);
  return urlMatch ? urlMatch[1] : null;
}

/**
 * Removes URL tag from message content
 */
export function removeURLTag(content: string): string {
  return content.replace(/\[URL:.*?\]/g, "").trim();
}
