import { Message as AIMessage } from "ai";

/**
 * 扩展的消息类型
 */
export interface Message extends AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

/**
 * 聊天状态
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * 聊天配置
 */
export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
