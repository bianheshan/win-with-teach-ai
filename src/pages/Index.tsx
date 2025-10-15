import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { supabase } from "@/integrations/supabase/client";
import { StageNavigation, Stage } from "@/components/StageNavigation";
import { ChatInterface } from "@/components/ChatInterface";
import { InteractionPanel } from "@/components/InteractionPanel";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  course_name: string;
  competition_group: string;
  current_stage: string;
  total_hours: number;
  created_at: string;
}

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
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentStage, setCurrentStage] = useState("preparation");
  const [currentStep, setCurrentStep] = useState("team");
  const [progress, setProgress] = useState<Record<string, any>>({});

  const { messages, isLoading: chatLoading, sendMessage } = useRealtimeChat({
    projectId: currentProject?.id,
    stage: currentStage,
    step: currentStep,
  });

  // 加载进度数据
  useEffect(() => {
    if (currentProject) {
      loadProgress();
    }
  }, [currentProject]);

  const loadProgress = async () => {
    if (!currentProject) return;

    try {
      const { data, error } = await supabase
        .from("progress_tracking")
        .select("*")
        .eq("project_id", currentProject.id);

      if (error) throw error;

      const progressMap: Record<string, any> = {};
      data?.forEach((item) => {
        const key = `${item.stage}-${item.step}`;
        progressMap[key] = item;
      });

      setProgress(progressMap);

      // 设置当前阶段为项目的当前阶段
      if (currentProject.current_stage) {
        setCurrentStage(currentProject.current_stage);
      }
    } catch (error) {
      console.error("Load progress error:", error);
    }
  };

  const handleStepClick = async (stageId: string, stepId: string) => {
    setCurrentStage(stageId);
    setCurrentStep(stepId);

    // 更新进度为"进行中"
    if (currentProject) {
      try {
        await supabase.from("progress_tracking").upsert({
          project_id: currentProject.id,
          stage: stageId,
          step: stepId,
          status: "in_progress",
        });
      } catch (error) {
        console.error("Update progress error:", error);
      }
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCurrentStage(project.current_stage || "preparation");
    toast.success(`已切换到项目：${project.title}`);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("已退出登录");
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth hook will redirect to /auth
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="h-16 border-b bg-gradient-to-r from-card to-card/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                教学能力大赛智能辅导平台
              </h1>
              <p className="text-xs text-muted-foreground">AI驱动·一站式辅导</p>
            </div>
          </div>
          <div className="ml-4">
            <ProjectSelector
              currentProject={currentProject}
              onSelectProject={handleProjectSelect}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-sm text-foreground font-medium">
              {user.email}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-smooth">
            <LogOut className="h-4 w-4 mr-2" />
            退出
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧：阶段导航 */}
        <div className="w-80 border-r bg-gradient-to-b from-sidebar to-sidebar/50 flex-shrink-0 shadow-md">
          <StageNavigation
            stages={stages.map((stage) => ({
              ...stage,
              steps: stage.steps.map((step) => ({
                ...step,
                completed:
                  progress[`${stage.id}-${step.id}`]?.status === "completed",
              })),
            }))}
            currentStage={currentStage}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* 中间：对话区 */}
        <div className="flex-1 min-w-0">
          {currentProject ? (
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={chatLoading}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
              <div className="text-center max-w-md space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg animate-pulse-glow">
                  <span className="text-5xl">🎓</span>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    欢迎使用智能辅导平台
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    AI智能分析 · 全程专业指导 · 助力一等奖
                  </p>
                </div>
                <div className="pt-4">
                  <ProjectSelector
                    currentProject={currentProject}
                    onSelectProject={handleProjectSelect}
                  />
                </div>
                <div className="pt-6 grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-card border space-y-1">
                    <div className="text-2xl">📋</div>
                    <div className="font-semibold">智能评估</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border space-y-1">
                    <div className="text-2xl">✨</div>
                    <div className="font-semibold">AI生成</div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border space-y-1">
                    <div className="text-2xl">🎯</div>
                    <div className="font-semibold">精准优化</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：交互区 */}
        {currentProject && (
          <div className="w-[28rem] border-l bg-gradient-to-b from-card to-muted/10 flex-shrink-0 shadow-lg">
            <InteractionPanel
              currentStage={currentStage}
              currentStep={currentStep}
              projectId={currentProject.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
