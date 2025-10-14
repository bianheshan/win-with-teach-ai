import { useState } from "react";
import { StageNavigation, Stage } from "@/components/StageNavigation";
import { ChatInterface, Message } from "@/components/ChatInterface";
import { InteractionPanel } from "@/components/InteractionPanel";

const stages: Stage[] = [
  {
    id: "preparation",
    title: "参赛准备",
    icon: "🎯",
    steps: [
      { id: "team", title: "团队组建评估" },
      { id: "topic", title: "选题评估分析" },
      { id: "resources", title: "教学资源盘点" },
      { id: "platform", title: "平台与工具准备" },
    ],
  },
  {
    id: "preliminary",
    title: "初赛阶段",
    icon: "📝",
    steps: [
      { id: "lesson-plan", title: "教案设计生成" },
      { id: "video-script", title: "视频脚本设计" },
      { id: "video-shoot", title: "视频拍摄指导" },
      { id: "report", title: "实施报告撰写" },
      { id: "standards", title: "课标人培审核" },
      { id: "materials", title: "佐证材料整理" },
    ],
  },
  {
    id: "final",
    title: "决赛阶段",
    icon: "🏆",
    steps: [
      { id: "presentation-ppt", title: "说课PPT制作" },
      { id: "presentation-script", title: "说课稿撰写" },
      { id: "teaching-ppt", title: "授课PPT制作" },
      { id: "teaching-script", title: "授课脚本编写" },
      { id: "qa-prep", title: "答辩问题准备" },
      { id: "evidence", title: "佐证材料制作" },
    ],
  },
];

const Index = () => {
  const [currentStage, setCurrentStage] = useState("preparation");
  const [currentStep, setCurrentStep] = useState("team");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "您好！我是教学能力大赛专业辅导助手。\n\n我将为您提供：\n✓ 参赛全流程专业指导\n✓ 材料智能生成与评估\n✓ 基于评分标准的精准打分\n✓ 针对性改进建议\n\n让我们一起冲刺一等奖！请告诉我您目前处于哪个阶段，或者有什么具体需求？",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStepClick = (stageId: string, stepId: string) => {
    setCurrentStage(stageId);
    setCurrentStep(stepId);

    // 自动发送相关提示
    const stage = stages.find(s => s.id === stageId);
    const step = stage?.steps.find(s => s.id === stepId);
    
    if (stage && step) {
      const contextMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `您已切换到【${stage.title}】-【${step.title}】\n\n我可以帮您：\n${getStepGuidance(stageId, stepId)}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, contextMessage]);
    }
  };

  const getStepGuidance = (stageId: string, stepId: string): string => {
    const guidance: Record<string, Record<string, string>> = {
      preparation: {
        team: "• 分析团队构成是否合理\n• 提供团队优化建议\n• 评估团队能力匹配度",
        topic: "• 评估课程选题适合度\n• 分析内容完整性和连续性\n• 识别潜在亮点与赛点",
        resources: "• 盘点现有教学资源\n• 识别资源缺口\n• 提供资源准备建议",
      },
      preliminary: {
        "lesson-plan": "• 辅助生成16学时教案\n• 评估教案完整性和规范性\n• 提供优化建议和打分",
        "video-script": "• 生成4段视频拍摄脚本\n• 确保一镜到底的可行性\n• 标注关键教学环节",
        report: "• 辅助撰写教学实施报告\n• 确保字数和图表要求\n• 评估报告质量打分",
      },
      final: {
        "presentation-ppt": "• 生成8分钟说课PPT\n• 突出参赛内容亮点\n• 符合决赛展示要求",
        "qa-prep": "• 预测可能的答辩问题\n• 准备标准答案\n• 整理佐证材料",
      },
    };

    return guidance[stageId]?.[stepId] || "请告诉我您的具体需求";
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(content, currentStage, currentStep),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string, stage: string, step: string): string => {
    // 这里将来会接入真实的AI
    return `我理解您在【${stages.find(s => s.id === stage)?.title}】阶段关于"${userInput}"的问题。\n\n基于教学能力大赛的评分标准和专家经验，我的建议是：\n\n1. 首先确保内容符合比赛基本要求\n2. 突出创新点和亮点\n3. 注重课程思政的自然融入\n4. 保持材料的一致性和完整性\n\n您可以在右侧工作区上传相关材料，我会为您提供详细的评估和打分。`;
  };

  return (
    <div className="h-screen w-full flex bg-background">
      {/* 左侧：阶段导航 */}
      <div className="w-80 border-r bg-sidebar flex-shrink-0">
        <StageNavigation
          stages={stages}
          currentStage={currentStage}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* 中间：对话区 */}
      <div className="flex-1 min-w-0">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* 右侧：交互区 */}
      <div className="w-96 border-l bg-card flex-shrink-0">
        <InteractionPanel currentStage={currentStage} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default Index;
