import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamStep } from "./steps/TeamStep";
import { TopicStep } from "./steps/TopicStep";
import { ResourcesStep } from "./steps/ResourcesStep";
import { PlatformStep } from "./steps/PlatformStep";
import { LessonPlanStep } from "./steps/LessonPlanStep";
import { VideoScriptStep } from "./steps/VideoScriptStep";
import { VideoShootStep } from "./steps/VideoShootStep";
import { ReportStep } from "./steps/ReportStep";
import { StandardsStep } from "./steps/StandardsStep";
import { MaterialsStep } from "./steps/MaterialsStep";
import { PresentationPPTStep } from "./steps/PresentationPPTStep";
import { PresentationScriptStep } from "./steps/PresentationScriptStep";
import { TeachingPPTStep } from "./steps/TeachingPPTStep";
import { TeachingScriptStep } from "./steps/TeachingScriptStep";
import { QAPrepStep } from "./steps/QAPrepStep";
import { EvidenceStep } from "./steps/EvidenceStep";

interface InteractionPanelProps {
  currentStage: string;
  currentStep: string;
  projectId: string;
}

export function InteractionPanel({ currentStage, currentStep, projectId }: InteractionPanelProps) {
  const renderContent = () => {
    // 参赛准备阶段
    if (currentStage === "preparation") {
      switch (currentStep) {
        case "team":
          return <TeamStep projectId={projectId} />;
        case "topic":
          return <TopicStep projectId={projectId} />;
        case "resources":
          return <ResourcesStep projectId={projectId} />;
        case "platform":
          return <PlatformStep projectId={projectId} />;
        default:
          return (
            <div className="text-center py-12 text-muted-foreground">
              请从左侧选择步骤
            </div>
          );
      }
    }

    // 初赛阶段
    if (currentStage === "preliminary") {
      switch (currentStep) {
        case "lesson-plan":
          return <LessonPlanStep projectId={projectId} />;
        case "video-script":
          return <VideoScriptStep projectId={projectId} />;
        case "video-shoot":
          return <VideoShootStep projectId={projectId} />;
        case "report":
          return <ReportStep projectId={projectId} />;
        case "standards":
          return <StandardsStep projectId={projectId} />;
        case "materials":
          return <MaterialsStep projectId={projectId} />;
        default:
          return (
            <div className="text-center py-12 text-muted-foreground">
              请从左侧选择步骤
            </div>
          );
      }
    }

    // 决赛阶段
    if (currentStage === "final") {
      switch (currentStep) {
        case "presentation-ppt":
          return <PresentationPPTStep projectId={projectId} />;
        case "presentation-script":
          return <PresentationScriptStep projectId={projectId} />;
        case "teaching-ppt":
          return <TeachingPPTStep projectId={projectId} />;
        case "teaching-script":
          return <TeachingScriptStep projectId={projectId} />;
        case "qa-prep":
          return <QAPrepStep projectId={projectId} />;
        case "evidence":
          return <EvidenceStep projectId={projectId} />;
        default:
          return (
            <div className="text-center py-12 text-muted-foreground">
              请从左侧选择步骤
            </div>
          );
      }
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
