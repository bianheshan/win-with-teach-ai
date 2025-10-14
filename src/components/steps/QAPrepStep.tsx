import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface QAPreparation {
  id: string;
  qa_list: any;
  total_questions: number;
  status: string;
}

interface QAPrepStepProps {
  projectId: string;
}

export function QAPrepStep({ projectId }: QAPrepStepProps) {
  const [qaPrep, setQAPrep] = useState<QAPreparation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQAPrep();
  }, [projectId]);

  const loadQAPrep = async () => {
    try {
      const { data, error } = await supabase
        .from("qa_preparation")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      setQAPrep(data);
    } catch (error) {
      console.error("Load QA prep error:", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: lessonPlans } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId);

      const { data: report } = await supabase
        .from("implementation_reports")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "qa_preparation",
          projectId,
          context: {
            lessonPlans: lessonPlans || [],
            report,
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("qa_preparation").upsert({
        project_id: projectId,
        qa_list: data.qa_list,
        total_questions: data.qa_list?.length || 0,
        status: "prepared",
      });

      if (insertError) throw insertError;

      toast.success("答辩问题准备完成");
      loadQAPrep();
    } catch (error) {
      console.error("Generate QA prep error:", error);
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
            <MessageSquare className="h-5 w-5 text-primary" />
            答辩问题准备
          </CardTitle>
          <CardDescription>
            预测评委可能提出的问题，准备详细的答辩策略
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
                AI生成答辩问题库
              </>
            )}
          </Button>

          {qaPrep && (
            <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {qaPrep.total_questions}
                </div>
                <div className="text-sm text-muted-foreground">个预测问题</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {qaPrep && qaPrep.qa_list && (
        <div className="space-y-3">
          {qaPrep.qa_list.map((qa: any, idx: number) => (
            <Card key={idx}>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      qa.difficulty === "high" ? "destructive" :
                      qa.difficulty === "medium" ? "default" :
                      "secondary"
                    }>
                      {qa.difficulty === "high" ? "高难度" :
                       qa.difficulty === "medium" ? "中等" : "基础"}
                    </Badge>
                    <Badge variant="outline">{qa.category}</Badge>
                  </div>
                  <div className="font-semibold text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{qa.question}</span>
                  </div>
                </div>

                <div className="pl-6 space-y-2">
                  <div>
                    <div className="text-xs font-semibold text-success mb-1">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      参考答案
                    </div>
                    <p className="text-sm text-muted-foreground">{qa.answer}</p>
                  </div>

                  {qa.tips && (
                    <div>
                      <div className="text-xs font-semibold text-primary mb-1">
                        💡 答辩技巧
                      </div>
                      <p className="text-xs text-muted-foreground italic">{qa.tips}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">答辩要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>理解问题：</strong>认真听题，必要时请评委重复</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>结构清晰：</strong>分点作答，条理分明</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>依据充分：</strong>结合理论、实践和数据</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>谦虚诚恳：</strong>承认不足，表达改进意愿</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>控制时间：</strong>简明扼要，避免冗长</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
