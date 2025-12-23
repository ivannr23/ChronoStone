-- Migraciones para Proyectos Extendidos - SQLite
-- Compatible con SQLite (desarrollo)

-- ============================================
-- NUEVAS COLUMNAS EN PROJECTS
-- ============================================

-- Agregar columnas nuevas a la tabla projects
ALTER TABLE projects ADD COLUMN project_status TEXT DEFAULT 'planning' CHECK (project_status IN ('planning', 'in_progress', 'paused', 'completed', 'archived'));
ALTER TABLE projects ADD COLUMN heritage_type TEXT;
ALTER TABLE projects ADD COLUMN protection_level TEXT;
ALTER TABLE projects ADD COLUMN budget REAL;
ALTER TABLE projects ADD COLUMN client_owner TEXT;
ALTER TABLE projects ADD COLUMN estimated_end_date TEXT;
ALTER TABLE projects ADD COLUMN progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- ============================================
-- TABLA: project_phases
-- ============================================

CREATE TABLE IF NOT EXISTS project_phases (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
  order_index INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON project_phases(status);

CREATE TRIGGER IF NOT EXISTS update_project_phases_updated_at 
AFTER UPDATE ON project_phases
BEGIN
  UPDATE project_phases SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- TABLA: project_documents
-- ============================================

CREATE TABLE IF NOT EXISTS project_documents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('memoria', 'plano', 'informe', 'presupuesto', 'foto', 'certificado', 'licencia', 'other')),
  version INTEGER DEFAULT 1,
  description TEXT,
  tags TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_category ON project_documents(category);
CREATE INDEX IF NOT EXISTS idx_project_documents_user_id ON project_documents(user_id);

CREATE TRIGGER IF NOT EXISTS update_project_documents_updated_at 
AFTER UPDATE ON project_documents
BEGIN
  UPDATE project_documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- TABLA: project_images
-- ============================================

CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER NOT NULL,
  phase_id TEXT REFERENCES project_phases(id) ON DELETE SET NULL,
  capture_date TEXT,
  description TEXT,
  tags TEXT,
  is_before INTEGER DEFAULT 0,
  is_after INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_phase_id ON project_images(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_images_user_id ON project_images(user_id);

CREATE TRIGGER IF NOT EXISTS update_project_images_updated_at 
AFTER UPDATE ON project_images
BEGIN
  UPDATE project_images SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- TABLA: project_budget_items
-- ============================================

CREATE TABLE IF NOT EXISTS project_budget_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  budgeted_amount REAL NOT NULL DEFAULT 0,
  actual_amount REAL DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_budget_items_project_id ON project_budget_items(project_id);

CREATE TRIGGER IF NOT EXISTS update_project_budget_items_updated_at 
AFTER UPDATE ON project_budget_items
BEGIN
  UPDATE project_budget_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- TABLA: project_collaborators
-- ============================================

CREATE TABLE IF NOT EXISTS project_collaborators (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT,
  email TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'coordinator', 'technician', 'viewer', 'external')),
  permissions TEXT DEFAULT '{"can_edit": false, "can_delete": false, "can_invite": false}',
  invited_at TEXT DEFAULT (datetime('now')),
  accepted_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- ============================================
-- TABLA: project_notes
-- ============================================

CREATE TABLE IF NOT EXISTS project_notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mentioned_users TEXT,
  parent_note_id TEXT REFERENCES project_notes(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_user_id ON project_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_parent_id ON project_notes(parent_note_id);

CREATE TRIGGER IF NOT EXISTS update_project_notes_updated_at 
AFTER UPDATE ON project_notes
BEGIN
  UPDATE project_notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;
