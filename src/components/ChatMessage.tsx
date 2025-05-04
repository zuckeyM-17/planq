import type { ReactNode } from "react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps): ReactNode {
  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="avatar">{isUser ? "👤" : "🦙"}</div>
      <div className="message-content">{content}</div>
    </div>
  );
}
