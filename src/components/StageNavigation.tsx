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
      <div className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-1">教学能力大赛</h2>
          <p className="text-xs text-muted-foreground">智能辅导助手</p>
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
                "rounded-lg border transition-all",
                isCurrent ? "border-primary bg-primary/5" : "border-border bg-card"
              )}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                  <span className="text-2xl">{stage.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className={cn(
                      "font-semibold text-sm",
                      isCurrent ? "text-primary" : "text-foreground"
                    )}>
                      {stage.title}
                    </h3>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-3 pb-2 space-y-1">
                  {stage.steps.map((step) => {
                    const isStepCurrent = currentStage === stage.id && currentStep === step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => onStepClick(stage.id, step.id)}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 rounded text-sm transition-colors text-left",
                          isStepCurrent
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0" />
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
