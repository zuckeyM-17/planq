import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface Message {
  content: string;
  isUser: boolean;
}

export function Chat(): ReactNode {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const webSocketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket接続を確立
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.hostname}:4567/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket接続が確立されました");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "stream") {
            setCurrentResponse((prev) => prev + data.content);

            if (data.done) {
              setCurrentResponse((prev) => {
                const fullResponse = prev + data.content;
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { content: fullResponse, isUser: false },
                ]);
                return "";
              });
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("メッセージの解析エラー:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket接続が閉じられました");
        setIsConnected(false);

        // 再接続を試みる
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocketエラー:", error);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  // メッセージが追加されたら自動スクロール
  // biome-ignore lint/correctness/useExhaustiveDependencies: 自動スクロールのために必要
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  // メッセージ送信処理
  const handleSendMessage = (message: string) => {
    // ユーザーメッセージを追加
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, isUser: true },
    ]);

    setIsLoading(true);

    // WebSocketを通じてメッセージを送信
    if (
      webSocketRef.current &&
      webSocketRef.current.readyState === WebSocket.OPEN
    ) {
      webSocketRef.current.send(JSON.stringify({ message }));
    } else {
      setIsLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: "サーバーに接続できませんでした。再接続中...",
          isUser: false,
        },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Claude 3.7 Sonnet チャットアシスタント</h2>
        <div
          className={`connection-status ${isConnected ? "connected" : "disconnected"}`}
        >
          {isConnected ? "接続済み" : "未接続"}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>ようこそ！</h3>
            <p>何でも質問してください。</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatMessage
            key={`${msg.content.substring(0, 10)}-${index}`}
            content={msg.content}
            isUser={msg.isUser}
          />
        ))}

        {isLoading && currentResponse && (
          <ChatMessage content={currentResponse} isUser={false} />
        )}

        {isLoading && !currentResponse && (
          <div className="loading-indicator">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || !isConnected}
      />
    </div>
  );
}
