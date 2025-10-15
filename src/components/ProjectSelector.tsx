import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Folder, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  course_name: string;
  competition_group: string;
  current_stage: string;
  created_at: string;
}

interface ProjectSelectorProps {
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export function ProjectSelector({ currentProject, onSelectProject }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // 新项目表单
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("");
  const [competitionGroup, setCompetitionGroup] = useState<string>("professional_1");
  const [totalHours, setTotalHours] = useState<number>(16);

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("competition_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Load projects error:", error);
      toast.error("加载项目失败");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!title.trim() || !courseName.trim()) {
      toast.error("请填写完整信息");
      return;
    }

    setCreating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("未登录");

      const { data, error } = await supabase
        .from("competition_projects")
        .insert({
          user_id: user.id,
          title: title.trim(),
          course_name: courseName.trim(),
          competition_group: competitionGroup,
          total_hours: totalHours,
          current_stage: "preparation",
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("项目创建成功！");
      setOpen(false);
      onSelectProject(data);

      // 重置表单
      setTitle("");
      setCourseName("");
      setCompetitionGroup("professional_1");
      setTotalHours(16);
    } catch (error: any) {
      console.error("Create project error:", error);
      toast.error("创建项目失败");
    } finally {
      setCreating(false);
    }
  };

  const groupLabels: Record<string, string> = {
    public_basic: "公共基础组",
    professional_1: "专业组一",
    professional_2: "专业组二",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:shadow-md transition-smooth">
          {currentProject ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Folder className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">{currentProject.title}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span className="font-semibold">创建/选择项目</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>项目管理</DialogTitle>
          <DialogDescription>选择现有项目或创建新项目</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* 创建新项目 */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/0">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">创建新项目</CardTitle>
                    <CardDescription>开始新的参赛准备</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">项目名称*</Label>
                  <Input
                    id="title"
                    placeholder="例如：信息技术基础课程教学设计"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName">课程名称*</Label>
                  <Input
                    id="courseName"
                    placeholder="例如：计算机应用基础"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="group">参赛组别*</Label>
                    <Select
                      value={competitionGroup}
                      onValueChange={setCompetitionGroup}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public_basic">公共基础组</SelectItem>
                        <SelectItem value="professional_1">专业组一</SelectItem>
                        <SelectItem value="professional_2">专业组二</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">总学时*</Label>
                    <Select
                      value={totalHours.toString()}
                      onValueChange={(v) => setTotalHours(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12学时</SelectItem>
                        <SelectItem value="16">16学时</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={createProject}
                  className="w-full mt-2"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      创建项目
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 现有项目列表 */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  我的项目
                </h3>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-smooth hover:scale-[1.02] ${
                        currentProject?.id === project.id
                          ? "border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 shadow-md"
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => {
                        onSelectProject(project);
                        setOpen(false);
                      }}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs">
                            {project.course_name}
                          </span>
                          <span className="text-xs">·</span>
                          <span className="text-xs">
                            {groupLabels[project.competition_group]}
                          </span>
                          <span className="text-xs">·</span>
                          <span className="text-xs">
                            {new Date(project.created_at).toLocaleDateString(
                              "zh-CN"
                            )}
                          </span>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
