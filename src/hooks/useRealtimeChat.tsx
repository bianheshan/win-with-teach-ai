import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/components/ChatInterface";

interface UseRealtimeChatProps {
  projectId?: string;
  stage: string;
  step: string;
}

export function useRealtimeChat({ projectId, stage, step }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "您好！我是教学能力大赛专业辅导助手。\n\n我将为您提供：\n✓ 参赛全流程专业指导\n✓ 材料智能生成与评估\n✓ 基于评分标准的精准打分\n✓ 针对性改进建议\n\n让我们一起冲刺一等奖！请告诉我您目前处于哪个阶段，或者有什么具体需求？",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 创建中断控制器
      abortControllerRef.current = new AbortController();

      try {
        // 调用AI聊天Edge Function
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: "user", content },
            ],
            context: {
              projectId,
              stage,
              step,
            },
          },
        });

        if (error) throw error;

        // 处理流式响应
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantMessageId = (Date.now() + 1).toString();

        // 添加空的助手消息
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  // 更新助手消息
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } catch (error: any) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `抱歉，发生了错误：${error.message || "请稍后重试"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, projectId, stage, step, isLoading]
  );

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    cancelRequest,
  };
}
