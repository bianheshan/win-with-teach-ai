import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TopicAnalysis {
  id: string;
  topic_title: string;
  topic_description: string;
  feasibility_score: number;
  innovation_score: number;
  competitiveness_score: number;
  ai_feedback: any;
  status: string;
}

interface TopicStepProps {
  projectId: string;
}

export function TopicStep({ projectId }: TopicStepProps) {
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    loadTopicAnalysis();
  }, [projectId]);

  const loadTopicAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from("topic_analysis" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAnalysis(data as any);
        setFormData({
          title: (data as any).topic_title,
          description: (data as any).topic_description,
        });
      }
    } catch (error) {
      console.error("Load topic analysis error:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description) {
      toast.error("请填写完整的选题信息");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "topic_analysis",
          projectId,
          requirements: {
            title: formData.title,
            description: formData.description,
          },
        },
      });

      if (error) throw error;

      const { error: insertError } = await supabase.from("topic_analysis" as any).upsert({
        project_id: projectId,
        topic_title: formData.title,
        topic_description: formData.description,
        feasibility_score: data.feasibility_score || 75,
        innovation_score: data.innovation_score || 80,
        competitiveness_score: data.competitiveness_score || 70,
        ai_feedback: data.feedback,
        status: "analyzed",
      } as any);

      if (insertError) throw insertError;

      toast.success("选题分析完成");
      loadTopicAnalysis();
    } catch (error) {
      console.error("Analyze topic error:", error);
      toast.error("选题分析失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            选题评估分析
          </CardTitle>
          <CardDescription>
            基于大赛要求，评估选题的可行性、创新性和竞争力
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">选题名称</Label>
              <Input
                id="title"
                placeholder="例如：基于项目式学习的Python程序设计"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">选题描述</Label>
              <Textarea
                id="description"
                placeholder="描述教学内容、学情分析、教学特色等..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  开始AI分析
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                评分结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">可行性</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${analysis.feasibility_score}%` }}
                    />
                  </div>
                  <Badge variant="outline">{analysis.feasibility_score}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">创新性</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${analysis.innovation_score}%` }}
                    />
                  </div>
                  <Badge variant="outline">{analysis.innovation_score}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">竞争力</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${analysis.competitiveness_score}%` }}
                    />
                  </div>
                  <Badge variant="outline">{analysis.competitiveness_score}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.ai_feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI专家建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {analysis.ai_feedback.strengths && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-semibold">优势特点</span>
                      </div>
                      <p className="text-muted-foreground pl-6">{analysis.ai_feedback.strengths}</p>
                    </div>
                  )}
                  
                  {analysis.ai_feedback.concerns && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="font-semibold">需要注意</span>
                      </div>
                      <p className="text-muted-foreground pl-6">{analysis.ai_feedback.concerns}</p>
                    </div>
                  )}

                  {analysis.ai_feedback.suggestions && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-semibold">优化建议</span>
                      </div>
                      <p className="text-muted-foreground pl-6">{analysis.ai_feedback.suggestions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">选题要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>符合职业教育教学特点</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>体现产教融合、工学结合</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>具有一定的创新性和特色</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>适合16-20课时完整实施</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
