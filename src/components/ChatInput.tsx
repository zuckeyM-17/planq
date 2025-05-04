import { useState } from "react";
import type { ReactNode, FormEvent, ChangeEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled,
}: ChatInputProps): ReactNode {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    onSendMessage(message);
    setMessage("");
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        className="chat-input"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力..."
        disabled={disabled}
        rows={1}
      />
      <button
        type="submit"
        className="send-button"
        disabled={disabled || message.trim() === ""}
      >
        送信
      </button>
    </form>
  );
}
