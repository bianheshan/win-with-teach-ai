import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const {
      type,
      projectId,
      context,
      requirements,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 根据类型构建不同的提示词
    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "lesson_plan":
        systemPrompt =
          "你是一位资深的职业教育教学设计专家，擅长编写符合教学能力大赛要求的教案。";
        userPrompt = `请根据以下信息生成一份完整的教案：

## 课程信息
课程名称：${context.courseName}
本节主题：${requirements.title}
课时：${requirements.duration || 45}分钟
教学对象：${context.targetStudents || "高职学生"}

## 要求
${requirements.objectives ? `教学目标：${requirements.objectives}` : ""}
${requirements.keyPoints ? `教学重点：${requirements.keyPoints.join("、")}` : ""}
${requirements.difficultPoints ? `教学难点：${requirements.difficultPoints.join("、")}` : ""}

请生成包含以下内容的教案：
1. 教学分析（学情分析、教材分析）
2. 教学目标（知识、能力、素质目标）
3. 教学重难点及解决策略
4. 教学方法与手段
5. 教学资源
6. 教学过程（导入、新授、巩固、总结、作业）
7. 板书设计
8. 教学反思

要求：
- 融入课程思政元素
- 体现信息化教学手段
- 注重学生活动设计
- 具有可操作性`;
        break;

      case "video_script":
        systemPrompt =
          "你是一位经验丰富的教学视频脚本编剧，熟悉教学能力大赛的视频要求。";
        userPrompt = `请为以下教学内容生成一份详细的视频拍摄脚本：

## 基本信息
课程：${context.courseName}
内容：${requirements.title}
时长：45分钟（一镜到底）

## 教学设计
${JSON.stringify(requirements.lessonPlan, null, 2)}

请生成包含以下内容的脚本：
1. 整体结构安排（时间轴）
2. 每个环节的具体内容和时间分配
3. 关键教学活动的详细描述
4. 师生互动的设计
5. 信息化手段的使用时机
6. 课程思政融入点
7. 摄像机位建议
8. 注意事项和应变方案

要求：
- 确保一镜到底的可行性
- 明确每个时间点的内容
- 突出亮点和创新点
- 考虑拍摄的连贯性`;
        break;

      case "implementation_report":
        systemPrompt =
          "你是一位教学能力大赛的专家，擅长撰写教学实施报告。";
        userPrompt = `请基于以下信息生成教学实施报告：

## 项目信息
${JSON.stringify(context, null, 2)}

## 要求
- 字数：4500-5000字
- 图表：不超过12张
- 格式：1.5倍行距

## 内容结构
1. 教学分析（600字）
   - 学情分析
   - 教材分析
   - 学习环境分析

2. 教学设计（1500字）
   - 教学理念与思路
   - 教学目标设计
   - 教学内容组织
   - 教学方法创新
   - 信息化手段应用
   - 课程思政融入

3. 教学实施（1500字）
   - 实施过程描述
   - 关键环节详述
   - 教学互动情况
   - 技术应用实效

4. 教学反思（900字）
   - 教学成效分析（含数据）
   - 问题识别
   - 改进措施
   - 创新点总结

请生成完整的报告内容，要求：
- 突出特色和亮点
- 数据图表支撑
- 逻辑清晰连贯
- 符合评分标准`;
        break;

      case "presentation_script":
        systemPrompt =
          "你是教学能力大赛决赛的资深指导教师，擅长编写说课稿。";
        userPrompt = `请生成一份8分钟的决赛说课稿：

## 项目信息
${JSON.stringify(context, null, 2)}

## 说课要求
时间：8分钟
内容：介绍整个参赛作品的教学实施报告

## 结构（严格控制时间）
1. 开场（30秒）- 问候和项目概述
2. 教学分析（1.5分钟）- 学情、教材、环境
3. 教学设计（3分钟）- 理念、目标、内容、方法、思政
4. 教学实施（2分钟）- 过程、亮点、效果
5. 教学反思（1分钟）- 成效、改进、创新

要求：
- 语言精炼专业
- 突出核心亮点
- 数据支撑关键论点
- 体现团队优势
- 留下深刻印象`;
        break;

      case "teaching_script":
        systemPrompt =
          "你是教学能力大赛的模拟授课专家，擅长编写精彩的授课脚本。";
        userPrompt = `请为决赛模拟授课生成脚本：

## 抽取内容
${JSON.stringify(requirements, null, 2)}

## 授课要求
- 时间：12-16分钟
- 形式：无学生的模拟授课
- 重点：展示教学能力和专业素养

## 脚本结构
1. 导入（2分钟）
2. 新课讲授（8-10分钟）
3. 巩固提升（2-3分钟）
4. 小结（1分钟）

要求：
- 清晰的教学逻辑
- 丰富的多媒体运用
- 生动的语言表达
- 适当的教学互动设计（虽无学生但要体现）
- 突出专业性和教学技能
- 自然融入课程思政`;
        break;

      case "qa_preparation":
        systemPrompt =
          "你是教学能力大赛的答辩指导专家，能够预测评委问题。";
        userPrompt = `请基于以下参赛作品，预测可能的答辩问题并提供参考答案：

## 作品信息
${JSON.stringify(context, null, 2)}

请生成：
1. 可能的答辩问题（15-20个）
   - 关于教学设计的问题
   - 关于教学实施的问题
   - 关于课程思政的问题
   - 关于信息化应用的问题
   - 关于教学反思的问题
   - 当前教育热点相关问题

2. 每个问题的参考答案
   - 简明扼要（每个答案1-2分钟）
   - 数据支撑
   - 展现专业性
   - 积极正面

3. 答辩策略建议`;
        break;

      default:
        throw new Error(`不支持的生成类型: ${type}`);
    }

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI服务错误: ${response.status}`);
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({
        content: generatedContent,
        type,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generate content error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "生成失败",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
