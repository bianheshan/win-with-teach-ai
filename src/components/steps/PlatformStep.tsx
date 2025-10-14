import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Monitor, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface PlatformTool {
  id: string;
  category: string;
  name: string;
  description: string;
  priority: string;
}

interface PlatformStepProps {
  projectId: string;
}

const platformCategories = [
  {
    id: "teaching",
    name: "教学平台",
    tools: [
      { name: "职教云", description: "在线教学平台", priority: "high" },
      { name: "学习通", description: "移动学习平台", priority: "high" },
      { name: "雨课堂", description: "智慧教学工具", priority: "medium" },
      { name: "钉钉课堂", description: "在线直播教学", priority: "medium" },
    ],
  },
  {
    id: "interaction",
    name: "互动工具",
    tools: [
      { name: "问卷星", description: "在线问卷调查", priority: "high" },
      { name: "投票工具", description: "课堂实时投票", priority: "medium" },
      { name: "弹幕工具", description: "课堂互动弹幕", priority: "low" },
      { name: "小组协作工具", description: "团队协作平台", priority: "medium" },
    ],
  },
  {
    id: "professional",
    name: "专业软件",
    tools: [
      { name: "行业软件", description: "专业技能训练", priority: "high" },
      { name: "仿真软件", description: "虚拟实训环境", priority: "medium" },
      { name: "设计软件", description: "创意设计工具", priority: "medium" },
      { name: "编程环境", description: "代码开发平台", priority: "high" },
    ],
  },
  {
    id: "recording",
    name: "录制设备",
    tools: [
      { name: "摄像设备", description: "高清摄像机", priority: "high" },
      { name: "录音设备", description: "专业麦克风", priority: "high" },
      { name: "补光设备", description: "摄影灯光", priority: "medium" },
      { name: "稳定器", description: "防抖支架", priority: "medium" },
    ],
  },
];

export function PlatformStep({ projectId }: PlatformStepProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSelectedTools();
  }, [projectId]);

  const loadSelectedTools = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_tools")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      
      const toolNames = data?.map((t) => `${t.category}-${t.name}`) || [];
      setSelectedTools(toolNames);
    } catch (error) {
      console.error("Load tools error:", error);
    }
  };

  const handleToggleTool = async (category: string, tool: any) => {
    const toolKey = `${category}-${tool.name}`;
    const isSelected = selectedTools.includes(toolKey);

    try {
      if (isSelected) {
        // 取消选择
        const { error } = await supabase
          .from("platform_tools")
          .delete()
          .eq("project_id", projectId)
          .eq("category", category)
          .eq("name", tool.name);

        if (error) throw error;
        
        setSelectedTools(selectedTools.filter((t) => t !== toolKey));
        toast.success("已移除工具");
      } else {
        // 添加选择
        const { error } = await supabase.from("platform_tools").insert({
          project_id: projectId,
          category,
          name: tool.name,
          description: tool.description,
          priority: tool.priority,
        });

        if (error) throw error;
        
        setSelectedTools([...selectedTools, toolKey]);
        toast.success("已添加工具");
      }
    } catch (error) {
      console.error("Toggle tool error:", error);
      toast.error("操作失败");
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    const labels: Record<string, string> = {
      high: "必备",
      medium: "建议",
      low: "可选",
    };
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {labels[priority]}
      </Badge>
    );
  };

  const completionRate = platformCategories.reduce((total, category) => {
    const categoryTools = category.tools.filter((tool) =>
      selectedTools.includes(`${category.id}-${tool.name}`)
    );
    return total + categoryTools.length;
  }, 0);

  const totalTools = platformCategories.reduce((total, cat) => total + cat.tools.length, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            平台与工具准备
          </CardTitle>
          <CardDescription>
            选择并准备教学所需的平台、软件和设备
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>准备进度</span>
              <span className="text-muted-foreground">
                {completionRate} / {totalTools}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(completionRate / totalTools) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {platformCategories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="text-sm">{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.tools.map((tool) => {
              const toolKey = `${category.id}-${tool.name}`;
              const isSelected = selectedTools.includes(toolKey);

              return (
                <div
                  key={tool.name}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleToggleTool(category.id, tool)}
                >
                  <Checkbox checked={isSelected} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{tool.name}</span>
                      {getPriorityBadge(tool.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">准备要点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>提前测试所有平台和软件</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>准备备用方案应对技术故障</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>确保学生端设备兼容性</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>录制设备需提前调试</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
