import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  title?: string;
  experience_years?: number;
  specialties?: string[];
}

interface TeamStepProps {
  projectId: string;
}

export function TeamStep({ projectId }: TeamStepProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMember, setNewMember] = useState<TeamMember>({
    name: "",
    role: "",
    title: "",
    experience_years: undefined,
    specialties: [],
  });
  const [specialtyInput, setSpecialtyInput] = useState("");

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Load team members error:", error);
      toast.error("加载团队成员失败");
    }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.role) {
      toast.error("请填写姓名和角色");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("team_members").insert({
        project_id: projectId,
        ...newMember,
      });

      if (error) throw error;

      toast.success("成员添加成功");
      setNewMember({
        name: "",
        role: "",
        title: "",
        experience_years: undefined,
        specialties: [],
      });
      setSpecialtyInput("");
      loadTeamMembers();
    } catch (error) {
      console.error("Add member error:", error);
      toast.error("添加成员失败");
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("成员删除成功");
      loadTeamMembers();
    } catch (error) {
      console.error("Delete member error:", error);
      toast.error("删除成员失败");
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setNewMember({
        ...newMember,
        specialties: [...(newMember.specialties || []), specialtyInput.trim()],
      });
      setSpecialtyInput("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            团队成员管理
          </CardTitle>
          <CardDescription>
            优秀团队构成：老中青搭配、包含企业兼职教师、至少一人熟练信息化手段
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 现有成员列表 */}
          <div className="space-y-3">
            <Label>当前团队（{members.length}人）</Label>
            {members.map((member) => (
              <Card key={member.id} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{member.name}</span>
                        <Badge variant="outline">{member.role}</Badge>
                        {member.title && (
                          <Badge variant="secondary">{member.title}</Badge>
                        )}
                      </div>
                      {member.experience_years && (
                        <p className="text-sm text-muted-foreground">
                          教龄：{member.experience_years}年
                        </p>
                      )}
                      {member.specialties && member.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMember(member.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 添加新成员 */}
          <div className="space-y-4 pt-4 border-t">
            <Label>添加新成员</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  placeholder="张三"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Input
                  id="role"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                  placeholder="主讲教师/助教/企业导师"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">职称</Label>
                <Input
                  id="title"
                  value={newMember.title || ""}
                  onChange={(e) =>
                    setNewMember({ ...newMember, title: e.target.value })
                  }
                  placeholder="讲师/副教授/教授"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">教龄（年）</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newMember.experience_years || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      experience_years: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>专长领域</Label>
              <div className="flex gap-2">
                <Input
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  placeholder="例如：信息化教学、课程思政"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button variant="outline" onClick={addSpecialty}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newMember.specialties && newMember.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newMember.specialties.map((specialty, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setNewMember({
                          ...newMember,
                          specialties: newMember.specialties?.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                    >
                      {specialty} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={addMember} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              添加成员
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">团队评估建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>推荐4人团队：老中青搭配，男女搭配</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>主讲教师应有丰富授课经验和获奖经历</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>建议包含企业兼职教师，体现产教融合</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>至少一名成员熟练掌握信息化教学手段</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>如有专业带头人或系领导参与更佳</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
