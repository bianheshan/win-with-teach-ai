import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Plus, Trash2, FileText, Image, Video, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  resource_type: string;
  resource_name: string;
  resource_url?: string;
  description?: string;
  status: string;
}

interface ResourcesStepProps {
  projectId: string;
}

const resourceTypes = [
  { value: "textbook", label: "教材", icon: FileText },
  { value: "courseware", label: "课件", icon: FileText },
  { value: "video", label: "视频", icon: Video },
  { value: "image", label: "图片素材", icon: Image },
  { value: "case", label: "案例资料", icon: FileText },
  { value: "tool", label: "工具软件", icon: LinkIcon },
  { value: "other", label: "其他", icon: FolderOpen },
];

export function ResourcesStep({ projectId }: ResourcesStepProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    url: "",
    description: "",
  });

  useEffect(() => {
    loadResources();
  }, [projectId]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from("teaching_resources")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Load resources error:", error);
      toast.error("加载资源失败");
    }
  };

  const handleAdd = async () => {
    if (!formData.type || !formData.name) {
      toast.error("请填写资源类型和名称");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("teaching_resources").insert({
        project_id: projectId,
        resource_type: formData.type,
        resource_name: formData.name,
        resource_url: formData.url || null,
        description: formData.description || null,
        status: "available",
      });

      if (error) throw error;

      toast.success("资源添加成功");
      setFormData({ type: "", name: "", url: "", description: "" });
      loadResources();
    } catch (error) {
      console.error("Add resource error:", error);
      toast.error("添加资源失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("teaching_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("资源删除成功");
      loadResources();
    } catch (error) {
      console.error("Delete resource error:", error);
      toast.error("删除资源失败");
    }
  };

  const getResourceTypeLabel = (type: string) => {
    return resourceTypes.find((t) => t.value === type)?.label || type;
  };

  const getResourceTypeIcon = (type: string) => {
    const Icon = resourceTypes.find((t) => t.value === type)?.icon || FolderOpen;
    return <Icon className="h-4 w-4" />;
  };

  const resourceStats = resourceTypes.map((type) => ({
    ...type,
    count: resources.filter((r) => r.resource_type === type.value).length,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            教学资源盘点
          </CardTitle>
          <CardDescription>
            整理课程所需的教材、课件、视频、案例等教学资源
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {resourceStats.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.value} className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{type.label}</div>
                      <div className="text-lg font-semibold">{type.count}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>资源类型</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>资源名称</Label>
                <Input
                  placeholder="例如：Python基础教材"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>资源链接（可选）</Label>
              <Input
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>描述说明（可选）</Label>
              <Input
                placeholder="简要说明该资源的用途和特点"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button onClick={handleAdd} disabled={loading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              添加资源
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getResourceTypeIcon(resource.resource_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{resource.resource_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getResourceTypeLabel(resource.resource_type)}
                      </Badge>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    )}
                    {resource.resource_url && (
                      <a
                        href={resource.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        查看资源
                      </a>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(resource.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">资源准备要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>确保教材版本符合课程标准</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>准备丰富的企业真实案例</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>收集行业前沿技术资料</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>整理学生作品和成果</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
