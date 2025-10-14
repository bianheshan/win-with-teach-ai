import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ImplementationReport {
  id?: string;
  word_count: number;
  chart_count: number;
  status: string;
  ai_score?: number;
  version: number;
}

interface ReportStepProps {
  projectId: string;
}

export function ReportStep({ projectId }: ReportStepProps) {
  const [report, setReport] = useState<ImplementationReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [projectId]);

  const loadReport = async () => {
    try {
      const { data, error } = await supabase
        .from("implementation_reports")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error("Load report error:", error);
      toast.error("加载报告失败");
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // 获取项目信息
      const { data: project } = await supabase
        .from("competition_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      // 获取教案和视频脚本
      const { data: lessonPlans } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId);

      const { data: videoScripts } = await supabase
        .from("video_scripts")
        .select("*")
        .eq("project_id", projectId);

      // 调用AI生成实施报告
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "implementation_report",
          projectId,
          context: {
            ...project,
            lessonPlans,
            videoScripts,
          },
        },
      });

      if (error) throw error;

      // 保存报告
      const { error: insertError } = await supabase
        .from("implementation_reports")
        .insert({
          project_id: projectId,
          content: { generated: data.content },
          word_count: 0,
          chart_count: 0,
          status: "draft",
          version: (report?.version || 0) + 1,
        });

      if (insertError) throw insertError;

      toast.success("实施报告生成成功");
      loadReport();
    } catch (error) {
      console.error("Generate report error:", error);
      toast.error("生成报告失败");
    } finally {
      setLoading(false);
    }
  };

  const wordProgress = report ? (report.word_count / 5000) * 100 : 0;
  const chartProgress = report ? (report.chart_count / 12) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            教学实施报告
          </CardTitle>
          <CardDescription>
            4500-5000字，图表不超过12张
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm text-info-foreground">
                <p className="font-medium mb-1">报告规格要求</p>
                <ul className="text-xs opacity-90 space-y-1">
                  <li>• 文字：4500-5000字（不含图表）</li>
                  <li>• 图表：不超过12张</li>
                  <li>• 格式：1.5倍行距</li>
                  <li>• 页数：约8-10页</li>
                </ul>
              </div>
            </div>
          </div>

          {report ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {report.word_count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        当前字数 / 5000
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {report.chart_count}/12
                      </div>
                      <div className="text-xs text-muted-foreground">图表数量</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>字数进度</span>
                    <span className="text-muted-foreground">
                      {wordProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(wordProgress, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>图表进度</span>
                    <span className="text-muted-foreground">
                      {chartProgress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(chartProgress, 100)} className="h-2" />
                </div>
              </div>

              {report.ai_score && (
                <Card className="bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI评分</span>
                      <Badge variant="default" className="text-base">
                        {report.ai_score}/100
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  查看报告
                </Button>
                <Button variant="outline" className="flex-1">
                  AI优化建议
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={generateReport}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI生成实施报告
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">报告内容结构</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">1. 教学分析（约600字）</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• 学情分析（含数据支撑）</li>
                <li>• 教材分析</li>
                <li>• 学习环境分析</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">2. 教学设计（约1500字）</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• 教学理念与思路</li>
                <li>• 教学目标设计</li>
                <li>• 教学方法创新</li>
                <li>• 信息化手段应用</li>
                <li>• 课程思政融入</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">3. 教学实施（约1500字）</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• 实施过程描述</li>
                <li>• 关键环节详述</li>
                <li>• 教学互动情况</li>
                <li>• 技术应用实效</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">4. 教学反思（约900字）</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• 教学成效分析（含数据）</li>
                <li>• 问题识别</li>
                <li>• 改进措施</li>
                <li>• 创新点总结</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
