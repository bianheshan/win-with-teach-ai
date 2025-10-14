import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamStep } from "./steps/TeamStep";
import { LessonPlanStep } from "./steps/LessonPlanStep";
import { VideoScriptStep } from "./steps/VideoScriptStep";
import { ReportStep } from "./steps/ReportStep";

interface InteractionPanelProps {
  currentStage: string;
  currentStep: string;
  projectId: string;
}

export function InteractionPanel({ currentStage, currentStep, projectId }: InteractionPanelProps) {
  const renderContent = () => {
    // 参赛准备阶段
    if (currentStage === "preparation") {
      if (currentStep === "team") {
        return <TeamStep projectId={projectId} />;
      }
      // TODO: 其他准备阶段步骤
      return (
        <div className="text-center py-12 text-muted-foreground">
          该功能正在开发中...
        </div>
      );
    }

    // 初赛阶段
    if (currentStage === "preliminary") {
      if (currentStep === "lesson-plan") {
        return <LessonPlanStep projectId={projectId} />;
      }
      if (currentStep === "video-script") {
        return <VideoScriptStep projectId={projectId} />;
      }
      if (currentStep === "report") {
        return <ReportStep projectId={projectId} />;
      }
      // TODO: 其他初赛步骤
      return (
        <div className="text-center py-12 text-muted-foreground">
          该功能正在开发中...
        </div>
      );
    }

    // 决赛阶段
    if (currentStage === "final") {
      // TODO: 决赛阶段步骤
      return (
        <div className="text-center py-12 text-muted-foreground">
          该功能正在开发中...
        </div>
      );
    }

    return (
      <div className="text-center py-12 text-muted-foreground">
        请从左侧选择阶段和步骤
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">工作区</h2>
        <p className="text-sm text-muted-foreground mt-1">
          材料上传 · 智能生成 · 专业评估
        </p>
      </div>
      <ScrollArea className="flex-1 p-6">
        {renderContent()}
      </ScrollArea>
    </div>
  );
}
