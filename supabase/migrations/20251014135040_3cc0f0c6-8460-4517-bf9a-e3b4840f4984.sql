-- 创建参赛项目表
CREATE TABLE public.competition_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  competition_group TEXT NOT NULL CHECK (competition_group IN ('public_basic', 'professional_1', 'professional_2')),
  course_name TEXT NOT NULL,
  total_hours INTEGER NOT NULL CHECK (total_hours IN (12, 16)),
  current_stage TEXT NOT NULL DEFAULT 'preparation' CHECK (current_stage IN ('preparation', 'preliminary', 'final')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建团队成员表
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lead', 'co_teacher', 'enterprise_teacher', 'leader')),
  title TEXT,
  experience_years INTEGER,
  specialties TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建教案表
CREATE TABLE public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  objectives TEXT NOT NULL,
  key_points TEXT[],
  difficult_points TEXT[],
  teaching_methods TEXT[],
  content JSONB NOT NULL,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'reviewed', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, lesson_number)
);

-- 创建视频脚本表
CREATE TABLE public.video_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  video_number INTEGER NOT NULL,
  lesson_plan_id UUID REFERENCES public.lesson_plans(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  script_content JSONB NOT NULL,
  key_moments TEXT[],
  interaction_points TEXT[],
  tech_integration_points TEXT[],
  ideological_points TEXT[],
  ai_suggestions JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'filming', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, video_number)
);

-- 创建教学实施报告表
CREATE TABLE public.implementation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  chart_count INTEGER NOT NULL DEFAULT 0 CHECK (chart_count <= 12),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'reviewed', 'finalized')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建决赛材料表
CREATE TABLE public.final_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('presentation_ppt', 'presentation_script', 'teaching_ppt', 'teaching_script', 'qa_prep', 'evidence')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_suggestions JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'reviewed', 'finalized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建AI评估记录表
CREATE TABLE public.ai_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  target_id UUID,
  criteria JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback JSONB NOT NULL,
  suggestions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建文件上传表
CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('lesson_plan', 'video', 'report', 'course_standard', 'training_plan', 'evidence', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建进度跟踪表
CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.competition_projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, stage, step)
);

-- 启用 RLS
ALTER TABLE public.competition_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（用户只能访问自己的项目数据）
CREATE POLICY "Users can view own projects" ON public.competition_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.competition_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.competition_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.competition_projects
  FOR DELETE USING (auth.uid() = user_id);

-- 团队成员策略
CREATE POLICY "Users can view team members of own projects" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = team_members.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage team members of own projects" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = team_members.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 教案策略
CREATE POLICY "Users can manage lesson plans of own projects" ON public.lesson_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = lesson_plans.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 视频脚本策略
CREATE POLICY "Users can manage video scripts of own projects" ON public.video_scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = video_scripts.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 实施报告策略
CREATE POLICY "Users can manage implementation reports of own projects" ON public.implementation_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = implementation_reports.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 决赛材料策略
CREATE POLICY "Users can manage final materials of own projects" ON public.final_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = final_materials.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- AI评估策略
CREATE POLICY "Users can view AI assessments of own projects" ON public.ai_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = ai_assessments.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI assessments for own projects" ON public.ai_assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = ai_assessments.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 上传文件策略
CREATE POLICY "Users can manage uploaded files of own projects" ON public.uploaded_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = uploaded_files.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 进度跟踪策略
CREATE POLICY "Users can manage progress of own projects" ON public.progress_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.competition_projects
      WHERE competition_projects.id = progress_tracking.project_id
      AND competition_projects.user_id = auth.uid()
    )
  );

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加更新时间戳触发器
CREATE TRIGGER update_competition_projects_updated_at
  BEFORE UPDATE ON public.competition_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at
  BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_scripts_updated_at
  BEFORE UPDATE ON public.video_scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_implementation_reports_updated_at
  BEFORE UPDATE ON public.implementation_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_final_materials_updated_at
  BEFORE UPDATE ON public.final_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_tracking_updated_at
  BEFORE UPDATE ON public.progress_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 创建存储桶用于文件上传
INSERT INTO storage.buckets (id, name, public) 
VALUES ('competition-files', 'competition-files', false);

-- 存储桶RLS策略
CREATE POLICY "Users can upload files to own projects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'competition-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own project files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'competition-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own project files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'competition-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own project files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'competition-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );