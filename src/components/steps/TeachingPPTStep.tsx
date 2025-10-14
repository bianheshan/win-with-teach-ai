import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TeachingPPT {
  id: string;
  outline: any;
  slide_count: number;
  status: string;
}

interface TeachingPPTStepProps {
  projectId: string;
}

export function TeachingPPTStep({ projectId }: TeachingPPTStepProps) {
  const [ppt, setPPT] = useState<TeachingPPT | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPPT();
  }, [projectId]);

  const loadPPT = async () => {
    try {
      const { data, error } = await supabase
        .from("teaching_ppt" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      setPPT(data as any);
    } catch (error) {
      console.error("Load PPT error:", error);
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

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "teaching_ppt",
          projectId,
          context: {
            lessonPlan,
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("teaching_ppt" as any).upsert({
        project_id: projectId,
        outline: data.outline,
        slide_count: data.slide_count || 30,
        status: "draft",
      } as any);

      if (insertError) throw insertError;

      toast.success("授课PPT大纲生成成功");
      loadPPT();
    } catch (error) {
      console.error("Generate PPT error:", error);
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
            <Monitor className="h-5 w-5 text-primary" />
            授课PPT制作
          </CardTitle>
          <CardDescription>
            生成现场授课使用的教学PPT大纲和内容建议
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
                AI生成PPT大纲
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {ppt && ppt.outline && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">PPT大纲</CardTitle>
              <Badge>{ppt.slide_count}页</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ppt.outline.sections?.map((section: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{section.slides || "5-8"}页</Badge>
                    <span className="font-semibold text-sm">{section.title}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground pl-4">
                    {section.content?.map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">授课PPT要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>教学流程：</strong>导入→新授→练习→总结完整结构</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>互动设计：</strong>设置提问、讨论、投票等互动环节</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>实用性强：</strong>便于课堂操作，支持临场调整</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>技术融合：</strong>体现信息化教学工具应用</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
