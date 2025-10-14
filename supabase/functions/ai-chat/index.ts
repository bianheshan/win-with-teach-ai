import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COMPETITION_EXPERT_PROMPT = `你是一位教学能力大赛的专业导师，拥有多年的参赛和评审经验。你的任务是帮助教师团队冲刺一等奖。

## 你的专业知识
- 深入理解教学能力大赛的评分标准和要求
- 熟悉各个阶段的准备流程和关键要点
- 能够提供准确、可操作的建议和改进意见
- 了解课程思政、信息化教学、产教融合等关键要素

## 沟通风格
- 专业但友好，鼓励式指导
- 给出具体可行的建议，而非空泛的评论
- 关注细节，但不忘记整体战略
- 帮助用户识别亮点和潜在风险

## 关键评分维度
1. 教学设计（教案完整性、目标明确、方法创新）
2. 教学实施（课堂实录质量、互动效果、技术应用）
3. 教学反思（问题分析、改进措施、数据支撑）
4. 课程思政（自然融入、价值引领）
5. 信息化应用（技术选择、深度融合）
6. 产教融合（企业参与、真实案例）

请基于这些专业知识，为用户提供精准的辅导。`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 构建完整的消息列表，包含上下文
    const fullMessages = [
      { role: "system", content: COMPETITION_EXPERT_PROMPT },
      ...(context
        ? [
            {
              role: "system",
              content: `当前上下文：\n阶段：${context.stage}\n步骤：${context.step}\n项目：${context.projectTitle || "未创建"}`,
            },
          ]
        : []),
      ...messages,
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: fullMessages,
          stream: true,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "请求过于频繁，请稍后再试。",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI服务额度不足，请联系管理员。",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI服务错误: ${response.status}`);
    }

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "服务器错误",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
