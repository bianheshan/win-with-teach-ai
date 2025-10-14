import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
}

interface VideoShootStepProps {
  projectId: string;
}

const shootingChecklist = [
  {
    category: "拍摄前准备",
    items: [
      "场地清洁整理，移除无关物品",
      "检查光线条件，调整补光设备",
      "测试摄像机、麦克风等设备",
      "准备课堂所需教具和材料",
      "学生座位安排和分组确认",
      "教学PPT和软件提前打开测试",
    ],
  },
  {
    category: "拍摄中注意",
    items: [
      "保持一镜到底，避免暂停",
      "关注学生学习状态和表情",
      "捕捉师生互动和生生互动",
      "展示信息化技术应用场景",
      "记录学生作品和成果展示",
      "注意声音清晰度和画面稳定",
    ],
  },
  {
    category: "应急预案",
    items: [
      "备用教学活动方案",
      "设备故障处理预案",
      "学生突发状况应对",
      "网络中断应对措施",
      "时间管理调整方案",
    ],
  },
];

export function VideoShootStep({ projectId }: VideoShootStepProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, [projectId]);

  const loadChecklist = async () => {
    try {
      const { data, error } = await supabase
        .from("shooting_checklist" as any)
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      setChecklist((data as any) || []);
    } catch (error) {
      console.error("Load checklist error:", error);
    }
  };

  const handleToggle = async (category: string, item: string) => {
    const existingItem = checklist.find(
      (c) => c.category === category && c.item === item
    );

    try {
      if (existingItem) {
        // 更新状态
        const { error } = await supabase
          .from("shooting_checklist" as any)
          .update({ checked: !existingItem.checked })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // 新增记录
        const { error } = await supabase.from("shooting_checklist" as any).insert({
          project_id: projectId,
          category,
          item,
          checked: true,
        } as any);

        if (error) throw error;
      }

      loadChecklist();
    } catch (error) {
      console.error("Toggle checklist error:", error);
      toast.error("操作失败");
    }
  };

  const isItemChecked = (category: string, item: string) => {
    return checklist.some(
      (c) => c.category === category && c.item === item && c.checked
    );
  };

  const getCategoryProgress = (category: string) => {
    const categoryData = shootingChecklist.find((c) => c.category === category);
    if (!categoryData) return 0;

    const total = categoryData.items.length;
    const checked = categoryData.items.filter((item) =>
      isItemChecked(category, item)
    ).length;

    return Math.round((checked / total) * 100);
  };

  const totalProgress = Math.round(
    shootingChecklist.reduce((sum, cat) => sum + getCategoryProgress(cat.category), 0) /
      shootingChecklist.length
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            视频拍摄指导
          </CardTitle>
          <CardDescription>
            确保拍摄质量，做好充分准备和应急预案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>准备完成度</span>
              <span className="text-muted-foreground">{totalProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {shootingChecklist.map((section) => {
        const progress = getCategoryProgress(section.category);

        return (
          <Card key={section.category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{section.category}</CardTitle>
                <Badge variant="outline">{progress}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleToggle(section.category, item)}
                >
                  <Checkbox
                    checked={isItemChecked(section.category, item)}
                    className="mt-0.5"
                  />
                  <span className="text-sm flex-1">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            重要提示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span><strong>一镜到底：</strong>45分钟不能剪辑，需提前多次彩排</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span><strong>设备备份：</strong>准备备用摄像设备和存储卡</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span><strong>时间把控：</strong>严格控制在45分钟内完成教学</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            专业建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>建议多次试拍，总结问题并优化</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>学生状态调整到最佳，避免疲劳</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>选择最佳拍摄时段，避免噪音干扰</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>拍摄后立即检查视频质量</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
