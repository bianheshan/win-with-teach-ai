import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-gradient-to-r from-card via-card to-primary/5 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI 辅导对话</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              专业分析 · 精准建议 · 助力一等奖
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg">
                <span className="text-4xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                欢迎使用教学能力大赛智能助手
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                我将全程陪伴您的参赛之旅，从准备到决赛，提供专业的评估、生成和改进建议
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-primary font-medium">
                  智能分析
                </div>
                <div className="px-4 py-2 rounded-lg bg-success/5 border border-success/10 text-xs text-success font-medium">
                  内容生成
                </div>
                <div className="px-4 py-2 rounded-lg bg-accent/5 border border-accent/10 text-xs text-accent font-medium">
                  优化建议
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  AI
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm transition-smooth hover:shadow-md",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground"
                    : "bg-card border-2 border-border/50"
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-60 mt-2 block font-medium">
                  {message.timestamp.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  您
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                AI
              </div>
              <div className="bg-card border-2 border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">正在思考...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-gradient-to-r from-card to-muted/20 p-4 shadow-lg">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题或需求..."
            className="resize-none border-2 focus:border-primary/50 transition-smooth rounded-xl shadow-sm"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-full aspect-square rounded-xl bg-gradient-to-br from-primary to-primary-glow hover:shadow-glow transition-smooth"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
