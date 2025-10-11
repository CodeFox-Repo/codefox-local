import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 从消息内容中解析 URL
 * 支持格式: [OPEN_URL:https://example.com]
 */
export function parseURLFromMessage(content: string): string | null {
  const match = content.match(/\[OPEN_URL:(https?:\/\/[^\]]+)\]/);
  return match ? match[1] : null;
}

/**
 * 从消息内容中移除 URL 标记
 */
export function removeURLTag(content: string): string {
  return content.replace(/\[OPEN_URL:https?:\/\/[^\]]+\]/g, "").trim();
}

/**
 * 验证 URL 是否有效
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;

  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
