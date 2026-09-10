"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X, Bot, User, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chatWithBot } from "@/app/actions/chatbot-actions";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
}

/* ponytail: chỉ parse [text](url) nội bộ bot sinh ra; đổi sang react-markdown khi cần full markdown */
function renderBotText(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return part;
    return (
      <a key={i} href={m[2]} className="underline underline-offset-2 font-semibold">
        {m[1]}
      </a>
    );
  });
}

export function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Xin chào! Tôi là trợ lý AI của DLU OneDesk. Tôi có thể giúp bạn chẩn đoán lỗi và hướng dẫn khắc phục. Bạn đang gặp vấn đề gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { reply, shouldCreateTicket } = await chatWithBot([...messages, userMsg]);

      let finalReply = reply;
      if (shouldCreateTicket) {
        finalReply += "\n\n💡 Nếu cần hỗ trợ thêm, bạn có thể [tạo ticket](/dashboard/tickets/new) để kỹ thuật viên kiểm tra trực tiếp.";
      }

      setMessages((prev) => [...prev, { role: "model", text: finalReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Đã xảy ra lỗi. Vui lòng thử lại." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 transition-all",
          isOpen && "bg-destructive hover:bg-destructive/90"
        )}
        size="icon"
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[min(380px,calc(100vw-3rem))] max-h-[520px] z-50 shadow-2xl flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-primary" />
              Trợ lý AI DLU OneDesk
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3 max-h-[340px]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "model" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[280px] whitespace-pre-wrap break-words",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "model" ? renderBotText(msg.text) : msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <span className="animate-pulse">Đang suy nghĩ...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action */}
            <div className="px-4 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => router.push("/dashboard/tickets/new")}
              >
                <Ticket className="h-3.5 w-3.5 mr-1.5" />
                Tạo ticket hỗ trợ
              </Button>
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
