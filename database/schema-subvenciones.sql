-- =============================================
-- ESQUEMA DE SUBVENCIONES PARA PATRIMONIO
-- =============================================

-- Tabla principal de subvenciones
CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información básica
  name VARCHAR(500) NOT NULL,
  description TEXT,
  organization VARCHAR(255) NOT NULL, -- Organismo que la concede
  organization_type VARCHAR(50) NOT NULL, -- 'ministerio', 'ccaa', 'diputacion', 'ayuntamiento', 'fundacion', 'europeo'
  
  -- Ámbito geográfico
  region VARCHAR(100), -- CCAA o 'nacional' o 'europeo'
  province VARCHAR(100),
  municipality VARCHAR(100),
  
  -- Tipo de patrimonio elegible
  heritage_types TEXT[], -- ['iglesia', 'castillo', 'monumento', 'arqueologico', 'civil', 'industrial', 'natural']
  protection_levels TEXT[], -- ['BIC', 'BRL', 'catalogo_municipal', 'sin_proteccion']
  
  -- Beneficiarios elegibles
  eligible_beneficiaries TEXT[], -- ['ayuntamiento', 'diocesis', 'fundacion', 'particular', 'empresa']
  
  -- Cuantías
  min_amount DECIMAL(12,2),
  max_amount DECIMAL(12,2),
  funding_percentage INTEGER, -- Porcentaje máximo de financiación (ej: 80%)
  
  -- Fechas
  call_open_date DATE, -- Fecha apertura convocatoria
  call_close_date DATE, -- Fecha cierre convocatoria
  resolution_date DATE, -- Fecha prevista resolución
  execution_deadline DATE, -- Plazo máximo ejecución
  
  -- Estado
  status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'closed', 'resolved'
  year INTEGER,
  
  -- Enlaces y documentación
  official_url TEXT,
  bases_url TEXT, -- URL a las bases de la convocatoria
  application_url TEXT, -- URL para solicitar
  
  -- Documentación requerida
  required_documents JSONB DEFAULT '[]', -- Lista de documentos necesarios
  
  -- Información adicional
  notes TEXT,
  tags TEXT[],
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_grants_region ON grants(region);
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_year ON grants(year);
CREATE INDEX idx_grants_close_date ON grants(call_close_date);
CREATE INDEX idx_grants_organization_type ON grants(organization_type);
CREATE INDEX idx_grants_heritage_types ON grants USING GIN(heritage_types);

-- Tabla de suscripciones a alertas de subvenciones
CREATE TABLE IF NOT EXISTS grant_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Criterios de alerta
  regions TEXT[], -- CCAs de interés
  heritage_types TEXT[], -- Tipos de patrimonio
  organization_types TEXT[], -- Tipos de organismo
  min_amount DECIMAL(12,2),
  
  -- Configuración
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_alerts_user ON grant_alerts(user_id);

-- Tabla de solicitudes de subvenciones
CREATE TABLE IF NOT EXISTS grant_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES grants(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Información de la solicitud
  reference_number VARCHAR(100), -- Número de registro/expediente
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'preparing', 'submitted', 'under_review', 'approved', 'denied', 'desisted'
  
  -- Cuantías
  requested_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  
  -- Fechas
  submission_date DATE,
  resolution_date DATE,
  notification_date DATE,
  
  -- Documentación
  documents JSONB DEFAULT '[]', -- Lista de documentos con estado
  checklist JSONB DEFAULT '[]', -- Checklist de requisitos
  
  -- Notas y seguimiento
  notes TEXT,
  resolution_notes TEXT, -- Motivos de aprobación/denegación
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_applications_user ON grant_applications(user_id);
CREATE INDEX idx_grant_applications_grant ON grant_applications(grant_id);
CREATE INDEX idx_grant_applications_project ON grant_applications(project_id);
CREATE INDEX idx_grant_applications_status ON grant_applications(status);

-- Tabla de favoritos/guardados
CREATE TABLE IF NOT EXISTS grant_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, grant_id)
);

CREATE INDEX idx_grant_favorites_user ON grant_favorites(user_id);

-- Tabla de historial/notificaciones de subvenciones
CREATE TABLE IF NOT EXISTS grant_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES grant_applications(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'new_grant', 'deadline_reminder', 'status_change', 'resolution'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grant_notifications_user ON grant_notifications(user_id);
CREATE INDEX idx_grant_notifications_read ON grant_notifications(user_id, read);

-- Trigger para updated_at
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grant_alerts_updated_at BEFORE UPDATE ON grant_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grant_applications_updated_at BEFORE UPDATE ON grant_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_notifications ENABLE ROW LEVEL SECURITY;

-- Grants: todos pueden ver las activas
CREATE POLICY "Anyone can view active grants" ON grants
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage grants" ON grants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grant alerts: solo el usuario propietario
CREATE POLICY "Users can manage own alerts" ON grant_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Grant applications: solo el usuario propietario
CREATE POLICY "Users can manage own applications" ON grant_applications
  FOR ALL USING (auth.uid() = user_id);

-- Grant favorites: solo el usuario propietario
CREATE POLICY "Users can manage own favorites" ON grant_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Grant notifications: solo el usuario propietario
CREATE POLICY "Users can view own notifications" ON grant_notifications
  FOR ALL USING (auth.uid() = user_id);

