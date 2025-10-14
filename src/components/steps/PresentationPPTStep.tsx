import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Presentation, Loader2, Sparkles, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface PPTOutline {
  id: string;
  outline: any;
  slide_count: number;
  status: string;
}

interface PresentationPPTStepProps {
  projectId: string;
}

export function PresentationPPTStep({ projectId }: PresentationPPTStepProps) {
  const [outline, setOutline] = useState<PPTOutline | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOutline();
  }, [projectId]);

  const loadOutline = async () => {
    try {
      const { data, error } = await supabase
        .from("presentation_ppt" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      setOutline(data as any);
    } catch (error) {
      console.error("Load outline error:", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: lessonPlans } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId)
        .order("lesson_number");

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "presentation_ppt",
          projectId,
          context: {
            lessonPlans: lessonPlans || [],
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("presentation_ppt" as any).upsert({
        project_id: projectId,
        outline: data.outline,
        slide_count: data.slide_count || 20,
        status: "draft",
      } as any);

      if (insertError) throw insertError;

      toast.success("PPT大纲生成成功");
      loadOutline();
    } catch (error) {
      console.error("Generate outline error:", error);
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
            <Presentation className="h-5 w-5 text-primary" />
            说课PPT制作
          </CardTitle>
          <CardDescription>
            基于教学设计，生成专业的说课PPT大纲和内容建议
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

      {outline && outline.outline && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">PPT大纲</CardTitle>
              <Badge>{outline.slide_count}页</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outline.outline.sections?.map((section: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{section.slides || "3-5"}页</Badge>
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

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            PPT制作要点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>结构清晰：</strong>说课程、说学情、说目标、说过程、说评价</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>重点突出：</strong>突出教学设计的创新点和特色</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>图文并茂：</strong>适当使用图表、流程图等可视化</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>简洁美观：</strong>避免文字过多，保持专业风格</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
