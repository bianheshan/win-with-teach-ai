import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TeachingScript {
  id: string;
  script_content: any;
  estimated_duration: number;
  status: string;
}

interface TeachingScriptStepProps {
  projectId: string;
}

export function TeachingScriptStep({ projectId }: TeachingScriptStepProps) {
  const [script, setScript] = useState<TeachingScript | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScript();
  }, [projectId]);

  const loadScript = async () => {
    try {
      const { data, error } = await supabase
        .from("teaching_script" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      setScript(data as any);
    } catch (error) {
      console.error("Load script error:", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: lessonPlan } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId)
        .limit(1)
        .maybeSingle();

      const { data: pptData } = await supabase
        .from("teaching_ppt" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "teaching_script",
          projectId,
          context: {
            lessonPlan,
            pptOutline: (pptData as any)?.outline,
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("teaching_script" as any).upsert({
        project_id: projectId,
        script_content: data.content,
        estimated_duration: data.duration || 15,
        status: "draft",
      } as any);

      if (insertError) throw insertError;

      toast.success("授课脚本生成成功");
      loadScript();
    } catch (error) {
      console.error("Generate script error:", error);
      toast.error("生成失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            授课脚本编写
          </CardTitle>
          <CardDescription>
            生成详细的授课逐字稿，包含教学语言和活动设计
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI生成授课脚本
              </>
            )}
          </Button>

          {script && (
            <div className="flex items-center gap-4 p-3 bg-accent/50 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">预计时长</div>
                <div className="text-xs text-muted-foreground">
                  {script.estimated_duration}分钟
                </div>
              </div>
              <Badge className="ml-auto">
                {script.status === "draft" ? "草稿" : "已完成"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {script && script.script_content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">授课脚本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {script.script_content.sections?.map((section: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{section.duration}分钟</Badge>
                    <span className="font-semibold text-primary">{section.title}</span>
                  </div>
                  <div className="text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 border-primary/30">
                    {section.content}
                  </div>
                  {section.activities && section.activities.length > 0 && (
                    <div className="pl-4">
                      <div className="text-xs font-semibold mb-1">教学活动：</div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {section.activities.map((activity: string, i: number) => (
                          <li key={i}>• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">授课要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>语言精练：</strong>表达清晰、专业，避免口语化</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>互动充分：</strong>设计提问、讨论、展示等环节</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>逻辑清晰：</strong>环环相扣，层层递进</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>时间把控：</strong>严格按照时间节点推进</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
