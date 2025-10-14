import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PresentationScript {
  id: string;
  script_content: any;
  estimated_duration: number;
  status: string;
}

interface PresentationScriptStepProps {
  projectId: string;
}

export function PresentationScriptStep({ projectId }: PresentationScriptStepProps) {
  const [script, setScript] = useState<PresentationScript | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScript();
  }, [projectId]);

  const loadScript = async () => {
    try {
      const { data, error } = await supabase
        .from("presentation_script")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      setScript(data);
    } catch (error) {
      console.error("Load script error:", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: lessonPlans } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId);

      const { data: pptData } = await supabase
        .from("presentation_ppt")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "presentation_script",
          projectId,
          context: {
            lessonPlans: lessonPlans || [],
            pptOutline: pptData?.outline,
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("presentation_script").upsert({
        project_id: projectId,
        script_content: data.content,
        estimated_duration: data.duration || 10,
        status: "draft",
      });

      if (insertError) throw insertError;

      toast.success("说课稿生成成功");
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
            <FileText className="h-5 w-5 text-primary" />
            说课稿撰写
          </CardTitle>
          <CardDescription>
            生成结构完整、逻辑清晰的说课演讲稿
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
                AI生成说课稿
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
            <CardTitle className="text-sm">说课稿内容</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {script.script_content.sections?.map((section: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="font-semibold text-primary">{section.title}</div>
                  <div className="text-muted-foreground whitespace-pre-wrap pl-4">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">说课要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>开场：</strong>简明扼要介绍课程和设计理念</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>学情：</strong>深入分析学生特点和学习基础</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>设计：</strong>详细阐述教学设计思路和方法</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>特色：</strong>突出创新点和信息化应用</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>结尾：</strong>总结反思和预期效果</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
