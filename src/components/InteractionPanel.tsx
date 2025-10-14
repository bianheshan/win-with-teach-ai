import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, CheckCircle2, AlertCircle, Award } from "lucide-react";

interface InteractionPanelProps {
  currentStage: string;
  currentStep: string;
}

export function InteractionPanel({ currentStage, currentStep }: InteractionPanelProps) {
  const renderPreparationContent = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">📋</span>
            团队评估
          </CardTitle>
          <CardDescription>评估参赛团队的组成和能力</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">团队人数</label>
            <div className="flex gap-2">
              <Badge variant="outline">3人</Badge>
              <Badge variant="default">4人（推荐）</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">团队构成建议</label>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 老中青搭配，男女搭配</li>
              <li>✓ 主讲教师授课经验丰富</li>
              <li>✓ 包含企业兼职教师</li>
              <li>✓ 专业带头人或系领导参与</li>
              <li>✓ 至少一名成员熟练信息化手段</li>
            </ul>
          </div>
          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            上传团队信息
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">🎯</span>
            选题评估
          </CardTitle>
          <CardDescription>评估课程选题的适合度</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            开始选题评估分析
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreliminaryContent = () => (
    <Tabs defaultValue="lesson-plan" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="lesson-plan">教案</TabsTrigger>
        <TabsTrigger value="video">视频</TabsTrigger>
        <TabsTrigger value="report">报告</TabsTrigger>
      </TabsList>

      <TabsContent value="lesson-plan" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              教案设计与评估
            </CardTitle>
            <CardDescription>12/16学时教案的生成、编写和评估</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                    <div className="text-2xl font-bold text-accent">0/16</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>教案完成进度</span>
                <span className="text-muted-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                上传现有教案
              </Button>
              <Button variant="outline" className="w-full">
                AI 辅助生成教案
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">教案评估要点</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>教学内容与人培方案、课程标准一致</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>教学重难点解决策略明确</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>学情分析科学、有数据支撑</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>融入课程思政元素</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="video" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">🎬</span>
              视频脚本与拍摄
            </CardTitle>
            <CardDescription>3-4段课堂实录的脚本设计与评估</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <Card key={num} className="bg-muted/50">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-1">视频 {num}</div>
                      <Badge variant="outline" className="text-xs">45分钟</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button className="w-full">生成视频拍摄脚本</Button>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">拍摄要点</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• 一镜到底，不能剪辑</li>
                <li>• 体现师生、生生互动</li>
                <li>• 突出课程思政融入</li>
                <li>• 展示信息技术运用</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="report" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              教学实施报告
            </CardTitle>
            <CardDescription>5000字以内的实施报告撰写与评估</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-info mt-0.5" />
                <div className="text-sm text-info-foreground">
                  <p className="font-medium mb-1">字数要求</p>
                  <p className="text-xs opacity-90">文字不超过5000字，不包括图表（图表≤12张）</p>
                </div>
              </div>
            </div>

            <Button className="w-full">AI 辅助生成报告</Button>
            <Button variant="outline" className="w-full">上传现有报告评估</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderFinalContent = () => (
    <div className="space-y-4">
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            决赛准备
          </CardTitle>
          <CardDescription>8分钟说课 + 12-16分钟授课 + 10分钟答辩</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-card">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-lg font-bold text-primary">8min</div>
                <div className="text-xs text-muted-foreground">说课</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-lg font-bold text-primary">12-16min</div>
                <div className="text-xs text-muted-foreground">授课</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-lg font-bold text-primary">10min</div>
                <div className="text-xs text-muted-foreground">答辩</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Button className="w-full">生成说课PPT</Button>
            <Button variant="outline" className="w-full">生成授课PPT</Button>
            <Button variant="outline" className="w-full">预测答辩问题</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">答辩准备</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">答辩问题来源：</p>
            <ul className="space-y-1 text-sm">
              <li>• 提交材料（教案、视频、报告）</li>
              <li>• 参赛内容的亮点</li>
              <li>• 课程思政融入</li>
              <li>• 当前教育热点</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">
              查看佐证材料建议
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentStage) {
      case "preparation":
        return renderPreparationContent();
      case "preliminary":
        return renderPreliminaryContent();
      case "final":
        return renderFinalContent();
      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            请从左侧选择阶段和步骤
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">工作区</h2>
        <p className="text-sm text-muted-foreground mt-1">
          材料上传 · 智能生成 · 专业评估
        </p>
      </div>
      <ScrollArea className="flex-1 p-6">
        {renderContent()}
      </ScrollArea>
    </div>
  );
}
