-- Mejoras al esquema de proyectos
-- Agregar campos faltantes para gestión completa de proyectos patrimoniales

-- Agregar nuevas columnas a la tabla projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_status VARCHAR(50) DEFAULT 'planning' 
  CHECK (project_status IN ('planning', 'in_progress', 'paused', 'completed', 'archived')),
ADD COLUMN IF NOT EXISTS heritage_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS protection_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS client_owner VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_end_date DATE,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Crear tabla para fases del proyecto
CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_project_phases_status ON project_phases(status);

-- Crear tabla para documentos del proyecto
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50),
  category VARCHAR(100) DEFAULT 'other' CHECK (category IN ('memoria', 'plano', 'informe', 'presupuesto', 'foto', 'certificado', 'licencia', 'other')),
  version INTEGER DEFAULT 1,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_category ON project_documents(category);
CREATE INDEX idx_project_documents_user_id ON project_documents(user_id);

-- Crear tabla para imágenes del proyecto
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
  capture_date DATE,
  description TEXT,
  tags TEXT[],
  is_before BOOLEAN DEFAULT false,
  is_after BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_project_images_phase_id ON project_images(phase_id);
CREATE INDEX idx_project_images_user_id ON project_images(user_id);

-- Crear tabla para presupuestos y costes
CREATE TABLE IF NOT EXISTS project_budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  budgeted_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_budget_items_project_id ON project_budget_items(project_id);

-- Crear tabla para colaboradores del proyecto
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(100) DEFAULT 'viewer' CHECK (role IN ('owner', 'coordinator', 'technician', 'viewer', 'external')),
  permissions JSONB DEFAULT '{"can_edit": false, "can_delete": false, "can_invite": false}',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE UNIQUE INDEX idx_project_collaborators_unique ON project_collaborators(project_id, COALESCE(user_id::text, email));

-- Crear tabla para notas y comentarios
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mentioned_users UUID[],
  parent_note_id UUID REFERENCES project_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_user_id ON project_notes(user_id);
CREATE INDEX idx_project_notes_parent_id ON project_notes(parent_note_id);

-- Triggers para updated_at
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON project_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_images_updated_at BEFORE UPDATE ON project_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_budget_items_updated_at BEFORE UPDATE ON project_budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_notes_updated_at BEFORE UPDATE ON project_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para nuevas tablas

-- project_phases
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view phases of own projects" ON project_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_phases.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create phases in own projects" ON project_phases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_phases.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update phases in own projects" ON project_phases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_phases.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete phases in own projects" ON project_phases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_phases.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- project_documents
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents of own projects" ON project_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in own projects" ON project_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_documents.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents" ON project_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON project_documents
  FOR DELETE USING (auth.uid() = user_id);

-- project_images
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images of own projects" ON project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_images.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images in own projects" ON project_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_images.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own images" ON project_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON project_images
  FOR DELETE USING (auth.uid() = user_id);

-- project_budget_items
ALTER TABLE project_budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget of own projects" ON project_budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_budget_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage budget of own projects" ON project_budget_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_budget_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- project_collaborators
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators of own projects" ON project_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_collaborators.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage collaborators of own projects" ON project_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_collaborators.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- project_notes
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes of own projects" ON project_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes in own projects" ON project_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_notes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notes" ON project_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON project_notes
  FOR DELETE USING (auth.uid() = user_id);
