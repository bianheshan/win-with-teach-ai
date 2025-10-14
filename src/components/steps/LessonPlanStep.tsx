import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface LessonPlan {
  id?: string;
  lesson_number: number;
  title: string;
  objectives: string;
  duration_minutes: number;
  key_points?: string[];
  difficult_points?: string[];
  teaching_methods?: string[];
  status: string;
  ai_score?: number;
}

interface LessonPlanStepProps {
  projectId: string;
}

export function LessonPlanStep({ projectId }: LessonPlanStepProps) {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    objectives: "",
    duration: 45,
    keyPoints: "",
    difficultPoints: "",
  });

  useEffect(() => {
    loadLessonPlans();
  }, [projectId]);

  const loadLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("project_id", projectId)
        .order("lesson_number");

      if (error) throw error;
      setLessonPlans(data || []);
    } catch (error) {
      console.error("Load lesson plans error:", error);
      toast.error("加载教案失败");
    }
  };

  const generateLessonPlan = async () => {
    if (!newPlan.title || !newPlan.objectives) {
      toast.error("请填写课程标题和教学目标");
      return;
    }

    setGenerating(true);
    try {
      // 获取项目信息
      const { data: project } = await supabase
        .from("competition_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      // 调用AI生成教案
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "lesson_plan",
          projectId,
          context: {
            courseName: project?.course_name,
            targetStudents: "高职学生",
          },
          requirements: {
            title: newPlan.title,
            objectives: newPlan.objectives,
            duration: newPlan.duration,
            keyPoints: newPlan.keyPoints.split(",").filter(Boolean),
            difficultPoints: newPlan.difficultPoints.split(",").filter(Boolean),
          },
        },
      });

      if (error) throw error;

      // 保存教案
      const { error: insertError } = await supabase.from("lesson_plans").insert({
        project_id: projectId,
        lesson_number: lessonPlans.length + 1,
        title: newPlan.title,
        objectives: newPlan.objectives,
        duration_minutes: newPlan.duration,
        key_points: newPlan.keyPoints.split(",").filter(Boolean),
        difficult_points: newPlan.difficultPoints.split(",").filter(Boolean),
        content: { generated: data.content },
        status: "draft",
      });

      if (insertError) throw insertError;

      toast.success("教案生成成功");
      setDialogOpen(false);
      setNewPlan({
        title: "",
        objectives: "",
        duration: 45,
        keyPoints: "",
        difficultPoints: "",
      });
      loadLessonPlans();
    } catch (error) {
      console.error("Generate lesson plan error:", error);
      toast.error("生成教案失败");
    } finally {
      setGenerating(false);
    }
  };

  const evaluateLessonPlan = async (planId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("evaluate-lesson-plan", {
        body: { lessonPlanId: planId },
      });

      if (error) throw error;
      toast.success("教案评估完成");
      loadLessonPlans();
    } catch (error) {
      console.error("Evaluate lesson plan error:", error);
      toast.error("评估失败");
    } finally {
      setLoading(false);
    }
  };

  const completionRate = lessonPlans.length > 0 
    ? (lessonPlans.filter(p => p.status === "completed").length / 16) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            教案设计管理
          </CardTitle>
          <CardDescription>
            12-16学时完整教案，每学时45分钟
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">16</div>
                  <div className="text-xs text-muted-foreground">学时要求</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {lessonPlans.length}/16
                  </div>
                  <div className="text-xs text-muted-foreground">已创建</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {lessonPlans.filter(p => p.status === "completed").length}
                  </div>
                  <div className="text-xs text-muted-foreground">已完成</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>完成进度</span>
              <span className="text-muted-foreground">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                创建新教案
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI辅助生成教案</DialogTitle>
                <DialogDescription>
                  填写基本信息，AI将生成完整的教案内容
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">课程标题 *</Label>
                  <Input
                    id="title"
                    value={newPlan.title}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, title: e.target.value })
                    }
                    placeholder="例如：Python编程基础 - 第1课"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objectives">教学目标 *</Label>
                  <Textarea
                    id="objectives"
                    value={newPlan.objectives}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, objectives: e.target.value })
                    }
                    placeholder="描述本课的知识目标、能力目标、素质目标"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">课时（分钟）</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newPlan.duration}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          duration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyPoints">教学重点（用逗号分隔）</Label>
                  <Input
                    id="keyPoints"
                    value={newPlan.keyPoints}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, keyPoints: e.target.value })
                    }
                    placeholder="重点1,重点2,重点3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficultPoints">
                    教学难点（用逗号分隔）
                  </Label>
                  <Input
                    id="difficultPoints"
                    value={newPlan.difficultPoints}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        difficultPoints: e.target.value,
                      })
                    }
                    placeholder="难点1,难点2,难点3"
                  />
                </div>
                <Button
                  onClick={generateLessonPlan}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      生成教案
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* 教案列表 */}
      <div className="space-y-3">
        {lessonPlans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">第{plan.lesson_number}课</Badge>
                    <span className="font-semibold">{plan.title}</span>
                    {plan.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.objectives}
                  </p>
                  {plan.ai_score && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">AI评分: {plan.ai_score}/100</Badge>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => evaluateLessonPlan(plan.id!)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "评估"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">教案评分要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>完整性：教学分析、目标、方法、过程完整</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>创新性：教学方法、内容组织有创新</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>思政融入：自然融入课程思政元素</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>实践性：教学设计具有可操作性</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>学生中心：以学生为中心的教学设计</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>一致性：与人培方案、课程标准一致</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
