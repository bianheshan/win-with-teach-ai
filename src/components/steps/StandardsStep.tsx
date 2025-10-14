import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StandardsReview {
  id: string;
  curriculum_standards: string;
  training_program: string;
  alignment_score: number;
  ai_feedback: any;
  status: string;
}

interface StandardsStepProps {
  projectId: string;
}

export function StandardsStep({ projectId }: StandardsStepProps) {
  const [review, setReview] = useState<StandardsReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    standards: "",
    program: "",
  });

  useEffect(() => {
    loadReview();
  }, [projectId]);

  const loadReview = async () => {
    try {
      const { data, error } = await supabase
        .from("standards_review" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setReview(data as any);
        setFormData({
          standards: (data as any).curriculum_standards,
          program: (data as any).training_program,
        });
      }
    } catch (error) {
      console.error("Load review error:", error);
    }
  };

  const handleReview = async () => {
    if (!formData.standards || !formData.program) {
      toast.error("请填写完整的课标和人培方案信息");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "standards_review",
          projectId,
          requirements: {
            standards: formData.standards,
            program: formData.program,
          },
        },
      });

      if (error) throw error;

      const { error: upsertError } = await supabase.from("standards_review" as any).upsert({
        project_id: projectId,
        curriculum_standards: formData.standards,
        training_program: formData.program,
        alignment_score: data.alignment_score || 85,
        ai_feedback: data.feedback,
        status: "reviewed",
      } as any);

      if (upsertError) throw upsertError;

      toast.success("审核完成");
      loadReview();
    } catch (error) {
      console.error("Review error:", error);
      toast.error("审核失败");
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
            课标人培审核
          </CardTitle>
          <CardDescription>
            确保教学设计符合课程标准和人才培养方案要求
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>课程标准要求</Label>
              <Textarea
                placeholder="粘贴或输入相关课程标准的关键要求..."
                rows={4}
                value={formData.standards}
                onChange={(e) => setFormData({ ...formData, standards: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                包括知识目标、能力目标、素质目标等
              </p>
            </div>

            <div className="space-y-2">
              <Label>人才培养方案</Label>
              <Textarea
                placeholder="粘贴或输入人才培养方案的相关内容..."
                rows={4}
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                包括专业定位、培养目标、课程体系等
              </p>
            </div>

            <Button onClick={handleReview} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  审核中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI智能审核
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {review && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">对齐度评分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-warning via-primary to-success transition-all"
                      style={{ width: `${review.alignment_score}%` }}
                    />
                  </div>
                </div>
                <Badge
                  variant={
                    review.alignment_score >= 80
                      ? "default"
                      : review.alignment_score >= 60
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-lg px-4 py-1"
                >
                  {review.alignment_score}分
                </Badge>
              </div>
            </CardContent>
          </Card>

          {review.ai_feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">审核意见</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.ai_feedback.aligned_aspects && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="font-semibold text-sm">符合项</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {review.ai_feedback.aligned_aspects.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {review.ai_feedback.gaps && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="font-semibold text-sm">需要改进</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {review.ai_feedback.gaps.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {review.ai_feedback.suggestions && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">优化建议</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {review.ai_feedback.suggestions.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">审核要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>教学目标与课标要求高度一致</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>内容选取符合人才培养定位</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>教学方法体现职教特色</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>评价方式与培养目标匹配</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
