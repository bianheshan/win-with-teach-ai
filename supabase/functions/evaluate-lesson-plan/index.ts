import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EVALUATION_CRITERIA = {
  completeness: {
    weight: 20,
    items: [
      "教学目标明确具体",
      "教学内容完整连贯",
      "教学方法多样合理",
      "教学资源丰富实用",
      "教学评价科学有效",
    ],
  },
  innovation: {
    weight: 15,
    items: [
      "教学设计有创新点",
      "信息化手段应用得当",
      "教学方法改革突出",
    ],
  },
  ideological: {
    weight: 15,
    items: ["课程思政自然融入", "价值引领明确", "育人目标清晰"],
  },
  practicality: {
    weight: 20,
    items: [
      "教学设计可操作性强",
      "教学资源准备充分",
      "教学环节安排合理",
      "时间分配科学",
    ],
  },
  studentCentered: {
    weight: 15,
    items: [
      "学生活动设计充分",
      "师生互动设计合理",
      "关注学生差异",
    ],
  },
  consistency: {
    weight: 15,
    items: [
      "与课程标准一致",
      "与人培方案对应",
      "各教案之间衔接自然",
    ],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("未授权访问");
    }

    const { lessonPlanId, content } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 构建评估提示
    const evaluationPrompt = `作为教学能力大赛的专业评委，请对以下教案进行详细评估。

## 评估标准（总分100分）
1. 完整性 (20分)：教学目标、内容、方法、资源、评价等要素是否齐全
2. 创新性 (15分)：教学设计是否有亮点和创新
3. 思政融入 (15分)：课程思政是否自然融入，价值引领是否明确
4. 实用性 (20分)：教学设计是否可操作，资源是否充分
5. 学生中心 (15分)：是否体现学生主体地位，互动设计是否合理
6. 一致性 (15分)：与课标、人培方案是否一致

## 教案内容
${JSON.stringify(content, null, 2)}

请按照以下JSON格式返回评估结果，使用tool calling：
{
  "overall_score": 总分(0-100),
  "dimension_scores": {
    "completeness": { "score": 分数, "feedback": "具体反馈" },
    "innovation": { "score": 分数, "feedback": "具体反馈" },
    "ideological": { "score": 分数, "feedback": "具体反馈" },
    "practicality": { "score": 分数, "feedback": "具体反馈" },
    "studentCentered": { "score": 分数, "feedback": "具体反馈" },
    "consistency": { "score": 分数, "feedback": "具体反馈" }
  },
  "strengths": ["优点1", "优点2", "优点3"],
  "improvements": ["改进建议1", "改进建议2", "改进建议3"],
  "specific_suggestions": ["具体可操作的建议1", "建议2"]
}`;

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
          messages: [
            {
              role: "system",
              content:
                "你是一位经验丰富的教学能力大赛评委，负责评估教案质量。",
            },
            { role: "user", content: evaluationPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_evaluation",
                description: "返回教案评估结果",
                parameters: {
                  type: "object",
                  properties: {
                    overall_score: {
                      type: "number",
                      description: "总分 (0-100)",
                    },
                    dimension_scores: {
                      type: "object",
                      properties: {
                        completeness: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                        innovation: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                        ideological: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                        practicality: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                        studentCentered: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                        consistency: {
                          type: "object",
                          properties: {
                            score: { type: "number" },
                            feedback: { type: "string" },
                          },
                        },
                      },
                      required: [
                        "completeness",
                        "innovation",
                        "ideological",
                        "practicality",
                        "studentCentered",
                        "consistency",
                      ],
                    },
                    strengths: {
                      type: "array",
                      items: { type: "string" },
                    },
                    improvements: {
                      type: "array",
                      items: { type: "string" },
                    },
                    specific_suggestions: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "overall_score",
                    "dimension_scores",
                    "strengths",
                    "improvements",
                    "specific_suggestions",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_evaluation" },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI服务错误: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices[0].message.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI返回格式错误");
    }

    const evaluation = JSON.parse(toolCall.function.arguments);

    // 保存评估结果到数据库
    if (lessonPlanId) {
      await supabase
        .from("lesson_plans")
        .update({
          ai_score: evaluation.overall_score,
          ai_feedback: evaluation,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lessonPlanId);

      // 记录评估历史
      const { data: lessonPlan } = await supabase
        .from("lesson_plans")
        .select("project_id")
        .eq("id", lessonPlanId)
        .single();

      if (lessonPlan) {
        await supabase.from("ai_assessments").insert({
          project_id: lessonPlan.project_id,
          assessment_type: "lesson_plan",
          target_id: lessonPlanId,
          criteria: EVALUATION_CRITERIA,
          score: evaluation.overall_score,
          feedback: evaluation,
          suggestions: evaluation.specific_suggestions,
        });
      }
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Evaluate lesson plan error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "评估失败",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
