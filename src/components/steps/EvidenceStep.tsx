import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Upload, FileText, Image, Video, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FinalEvidence {
  id: string;
  material_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
}

interface EvidenceStepProps {
  projectId: string;
}

const evidenceTypes = [
  { value: "teaching_video", label: "教学视频片段", icon: Video, color: "text-red-500" },
  { value: "student_achievement", label: "学生成果展示", icon: Image, color: "text-green-500" },
  { value: "innovation_proof", label: "创新佐证材料", icon: Sparkles, color: "text-purple-500" },
  { value: "industry_cooperation", label: "产教融合证明", icon: FileText, color: "text-orange-500" },
  { value: "award_certificate", label: "获奖证书", icon: Award, color: "text-yellow-500" },
  { value: "other_evidence", label: "其他佐证", icon: FileText, color: "text-gray-500" },
];

export function EvidenceStep({ projectId }: EvidenceStepProps) {
  const [evidence, setEvidence] = useState<FinalEvidence[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadEvidence();
  }, [projectId]);

  const loadEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from("final_evidence" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvidence((data as any) || []);
    } catch (error) {
      console.error("Load evidence error:", error);
      toast.error("加载材料失败");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("文件大小不能超过100MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/final/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("competition-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("final_evidence" as any).insert({
        project_id: projectId,
        material_type: type,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
      } as any);

      if (insertError) throw insertError;

      toast.success("上传成功");
      loadEvidence();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: FinalEvidence) => {
    try {
      const { error: deleteFileError } = await supabase.storage
        .from("competition-files")
        .remove([item.file_path]);

      if (deleteFileError) throw deleteFileError;

      const { error: deleteRecordError } = await supabase
        .from("final_evidence" as any)
        .delete()
        .eq("id", item.id);

      if (deleteRecordError) throw deleteRecordError;

      toast.success("删除成功");
      loadEvidence();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("删除失败");
    }
  };

  const getEvidenceTypeInfo = (type: string) => {
    return evidenceTypes.find((t) => t.value === type) || evidenceTypes[evidenceTypes.length - 1];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const evidenceStats = evidenceTypes.map((type) => ({
    ...type,
    count: evidence.filter((e) => e.material_type === type.value).length,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            佐证材料制作
          </CardTitle>
          <CardDescription>
            准备决赛所需的高质量佐证材料和支撑文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {evidenceStats.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.value} className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${type.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{type.label}</div>
                      <div className="text-lg font-semibold">{type.count}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {evidenceTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card key={type.value}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="font-semibold text-sm">{type.label}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => document.getElementById(`upload-final-${type.value}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传材料
                </Button>
                <input
                  id={`upload-final-${type.value}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, type.value)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">已上传材料</CardTitle>
        </CardHeader>
        <CardContent>
          {evidence.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无材料</p>
            </div>
          ) : (
            <div className="space-y-2">
              {evidence.map((item) => {
                const typeInfo = getEvidenceTypeInfo(item.material_type);
                const Icon = typeInfo.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Icon className={`h-5 w-5 ${typeInfo.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {item.file_name}
                        </span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file_size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">材料准备要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>精选精编：</strong>选择最具代表性和说服力的材料</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>标注说明：</strong>每份材料附上简要说明和关联点</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>质量第一：</strong>确保图片清晰、文档规范</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span><strong>分类整理：</strong>按照评分维度组织材料</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
