import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubStep {
  id: string;
  title: string;
  completed?: boolean;
}

export interface Stage {
  id: string;
  title: string;
  icon: string;
  steps: SubStep[];
}

interface StageNavigationProps {
  stages: Stage[];
  currentStage: string;
  currentStep: string;
  onStepClick: (stageId: string, stepId: string) => void;
}

export function StageNavigation({ stages, currentStage, currentStep, onStepClick }: StageNavigationProps) {
  const [openStages, setOpenStages] = useState<string[]>([currentStage]);

  const toggleStage = (stageId: string) => {
    setOpenStages(prev =>
      prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-3">
        <div className="mb-8 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                教学能力大赛
              </h2>
              <p className="text-xs text-muted-foreground">智能辅导助手</p>
            </div>
          </div>
        </div>

        {stages.map((stage) => {
          const isOpen = openStages.includes(stage.id);
          const isCurrent = currentStage === stage.id;

          return (
            <Collapsible
              key={stage.id}
              open={isOpen}
              onOpenChange={() => toggleStage(stage.id)}
              className={cn(
                "rounded-xl border-2 transition-all shadow-sm",
                isCurrent 
                  ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md" 
                  : "border-sidebar-border bg-card hover:border-primary/30 hover:shadow-md"
              )}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 p-4 hover:bg-sidebar-accent/50 rounded-xl transition-smooth">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-smooth",
                    isCurrent ? "bg-primary/20" : "bg-sidebar-accent"
                  )}>
                    <span className="text-2xl">{stage.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={cn(
                      "font-bold text-sm",
                      isCurrent ? "text-primary" : "text-sidebar-foreground"
                    )}>
                      {stage.title}
                    </h3>
                  </div>
                  {isOpen ? (
                    <ChevronDown className={cn(
                      "h-5 w-5 transition-smooth",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  ) : (
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-smooth",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-3 pb-3 pt-2 space-y-1.5">
                  {stage.steps.map((step) => {
                    const isStepCurrent = currentStage === stage.id && currentStep === step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => onStepClick(stage.id, step.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-smooth text-left group",
                          isStepCurrent
                            ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-md"
                            : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary hover:shadow-sm"
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isStepCurrent ? "text-primary-foreground" : "text-success"
                          )} />
                        ) : (
                          <Circle className={cn(
                            "h-5 w-5 flex-shrink-0 transition-smooth",
                            isStepCurrent ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                          )} />
                        )}
                        <span className="flex-1">{step.title}</span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );
}
