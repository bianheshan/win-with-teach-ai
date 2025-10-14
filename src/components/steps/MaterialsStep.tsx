import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Upload, FileText, Image, Video, File, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface EvidenceMaterial {
  id: string;
  material_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  description?: string;
}

interface MaterialsStepProps {
  projectId: string;
}

const materialTypes = [
  { value: "student_work", label: "学生作品", icon: FileText, color: "text-blue-500" },
  { value: "teaching_record", label: "教学记录", icon: FileText, color: "text-green-500" },
  { value: "assessment", label: "考核材料", icon: FileText, color: "text-purple-500" },
  { value: "industry_doc", label: "企业文件", icon: FileText, color: "text-orange-500" },
  { value: "photo", label: "教学照片", icon: Image, color: "text-pink-500" },
  { value: "video_clip", label: "视频片段", icon: Video, color: "text-red-500" },
  { value: "other", label: "其他材料", icon: File, color: "text-gray-500" },
];

export function MaterialsStep({ projectId }: MaterialsStepProps) {
  const [materials, setMaterials] = useState<EvidenceMaterial[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [projectId]);

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("evidence_materials")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Load materials error:", error);
      toast.error("加载材料失败");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件大小限制 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error("文件大小不能超过50MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("competition-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("competition-files")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("evidence_materials").insert({
        project_id: projectId,
        material_type: type,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
      });

      if (insertError) throw insertError;

      toast.success("上传成功");
      loadMaterials();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (material: EvidenceMaterial) => {
    try {
      const { error: deleteFileError } = await supabase.storage
        .from("competition-files")
        .remove([material.file_path]);

      if (deleteFileError) throw deleteFileError;

      const { error: deleteRecordError } = await supabase
        .from("evidence_materials")
        .delete()
        .eq("id", material.id);

      if (deleteRecordError) throw deleteRecordError;

      toast.success("删除成功");
      loadMaterials();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("删除失败");
    }
  };

  const getMaterialTypeInfo = (type: string) => {
    return materialTypes.find((t) => t.value === type) || materialTypes[materialTypes.length - 1];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const materialStats = materialTypes.map((type) => ({
    ...type,
    count: materials.filter((m) => m.material_type === type.value).length,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            佐证材料整理
          </CardTitle>
          <CardDescription>
            收集整理学生作品、教学记录、企业文件等佐证材料
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {materialStats.map((type) => {
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
        {materialTypes.map((type) => {
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
                  onClick={() => document.getElementById(`upload-${type.value}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传文件
                </Button>
                <input
                  id={`upload-${type.value}`}
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
          {materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无材料，请开始上传</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => {
                const typeInfo = getMaterialTypeInfo(material.material_type);
                const Icon = typeInfo.icon;

                return (
                  <div
                    key={material.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Icon className={`h-5 w-5 ${typeInfo.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {material.file_name}
                        </span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(material.file_size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(material)}
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
              <span>学生作品要真实、完整、有代表性</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>企业合作文件需盖章或签字</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>教学记录要体现全过程</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>照片和视频需清晰、有说明</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
