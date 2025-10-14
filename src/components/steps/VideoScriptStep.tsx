import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VideoScript {
  id?: string;
  video_number: number;
  title: string;
  lesson_plan_id?: string;
  duration_minutes: number;
  status: string;
  key_moments?: string[];
}

interface LessonPlan {
  id: string;
  title: string;
  lesson_number: number;
}

interface VideoScriptStepProps {
  projectId: string;
}

export function VideoScriptStep({ projectId }: VideoScriptStepProps) {
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>("");

  useEffect(() => {
    loadVideoScripts();
    loadLessonPlans();
  }, [projectId]);

  const loadVideoScripts = async () => {
    try {
      const { data, error } = await supabase
        .from("video_scripts")
        .select("*")
        .eq("project_id", projectId)
        .order("video_number");

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error("Load video scripts error:", error);
      toast.error("加载视频脚本失败");
    }
  };

  const loadLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_plans")
        .select("id, title, lesson_number")
        .eq("project_id", projectId)
        .order("lesson_number");

      if (error) throw error;
      setLessonPlans(data || []);
    } catch (error) {
      console.error("Load lesson plans error:", error);
    }
  };

  const generateVideoScript = async () => {
    if (!selectedLesson) {
      toast.error("请先选择对应的教案");
      return;
    }

    setLoading(true);
    try {
      // 获取教案详情
      const { data: lessonPlan, error: planError } = await supabase
        .from("lesson_plans")
        .select("*")
        .eq("id", selectedLesson)
        .single();

      if (planError) throw planError;

      // 获取项目信息
      const { data: project } = await supabase
        .from("competition_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      // 调用AI生成视频脚本
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "video_script",
          projectId,
          context: {
            courseName: project?.course_name,
          },
          requirements: {
            title: lessonPlan.title,
            lessonPlan: lessonPlan.content,
          },
        },
      });

      if (error) throw error;

      // 保存视频脚本
      const { error: insertError } = await supabase.from("video_scripts").insert({
        project_id: projectId,
        video_number: scripts.length + 1,
        title: lessonPlan.title,
        lesson_plan_id: selectedLesson,
        duration_minutes: 45,
        script_content: { generated: data.content },
        status: "draft",
      });

      if (insertError) throw insertError;

      toast.success("视频脚本生成成功");
      setSelectedLesson("");
      loadVideoScripts();
    } catch (error) {
      console.error("Generate video script error:", error);
      toast.error("生成视频脚本失败");
    } finally {
      setLoading(false);
    }
  };

  const completionRate = scripts.length > 0 
    ? (scripts.filter(s => s.status === "completed").length / 4) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            视频脚本设计
          </CardTitle>
          <CardDescription>
            3-4段45分钟课堂实录，一镜到底不剪辑
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => {
              const script = scripts.find(s => s.video_number === num);
              return (
                <Card key={num} className={script ? "bg-primary/5" : "bg-muted/50"}>
                  <CardContent className="pt-4 pb-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-1">视频 {num}</div>
                      {script ? (
                        <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">未创建</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择对应教案</label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                <SelectTrigger>
                  <SelectValue placeholder="选择一个教案" />
                </SelectTrigger>
                <SelectContent>
                  {lessonPlans
                    .filter(lp => !scripts.some(s => s.lesson_plan_id === lp.id))
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        第{plan.lesson_number}课：{plan.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateVideoScript}
              disabled={loading || !selectedLesson}
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
                  生成视频脚本
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 脚本列表 */}
      <div className="space-y-3">
        {scripts.map((script) => (
          <Card key={script.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">视频{script.video_number}</Badge>
                    <span className="font-semibold">{script.title}</span>
                    {script.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    时长：{script.duration_minutes}分钟（一镜到底）
                  </p>
                  {script.key_moments && script.key_moments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {script.key_moments.slice(0, 3).map((moment, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {moment}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">视频拍摄要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
              <span><strong>一镜到底：</strong>45分钟不能剪辑，确保流畅性</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>体现师生互动、生生互动</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>展示信息化技术深度应用</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>自然融入课程思政元素</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>关注学生学习过程和状态</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>准备应变预案，防止意外</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
