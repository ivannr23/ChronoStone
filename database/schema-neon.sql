-- Patrimonio Digital - Esquema de Base de Datos para Neon
-- Ejecutar en Neon SQL Editor (https://console.neon.tech)

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios (con autenticación propia)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL si usa magic link o OAuth
  full_name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Tabla de sesiones para NextAuth
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para sessions
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Tabla de tokens de verificación (magic links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) NOT NULL CHECK (plan_id IN ('free_trial', 'starter', 'professional', 'enterprise')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Tabla de límites de uso
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  projects_count INTEGER DEFAULT 0 CHECK (projects_count >= 0),
  storage_used BIGINT DEFAULT 0 CHECK (storage_used >= 0),
  models_3d_count INTEGER DEFAULT 0 CHECK (models_3d_count >= 0),
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  location VARCHAR(500),
  start_date DATE,
  end_date DATE,
  metadata JSONB DEFAULT '{}',
  is_trial_project BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Tabla de modelos 3D
CREATE TABLE IF NOT EXISTS models_3d (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50),
  thumbnail_url TEXT,
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para models_3d
CREATE INDEX idx_models_3d_project_id ON models_3d(project_id);
CREATE INDEX idx_models_3d_user_id ON models_3d(user_id);
CREATE INDEX idx_models_3d_status ON models_3d(processing_status);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  invoice_pdf TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);

-- Tabla de actividad/logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON usage_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_3d_updated_at BEFORE UPDATE ON models_3d
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear usuario con suscripción trial
CREATE OR REPLACE FUNCTION create_user_with_trial(
  p_email VARCHAR(255),
  p_password_hash VARCHAR(255),
  p_full_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Crear usuario
  INSERT INTO users (email, password_hash, full_name, email_verified)
  VALUES (p_email, p_password_hash, p_full_name, false)
  RETURNING id INTO v_user_id;
  
  -- Crear límites de uso
  INSERT INTO usage_limits (user_id)
  VALUES (v_user_id);
  
  -- Crear suscripción trial
  INSERT INTO subscriptions (user_id, plan_id, status, trial_start, trial_end)
  VALUES (
    v_user_id, 
    'free_trial', 
    'trialing',
    NOW(),
    NOW() + INTERVAL '14 days'
  );
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contador de proyectos
CREATE OR REPLACE FUNCTION update_projects_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE usage_limits 
    SET projects_count = projects_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE usage_limits 
    SET projects_count = GREATEST(0, projects_count - 1) 
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para contador de proyectos
CREATE TRIGGER update_projects_count_trigger
  AFTER INSERT OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_count();

-- Función para actualizar contador de modelos
CREATE OR REPLACE FUNCTION update_models_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE usage_limits 
    SET models_3d_count = models_3d_count + 1,
        storage_used = storage_used + NEW.file_size
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE usage_limits 
    SET models_3d_count = GREATEST(0, models_3d_count - 1),
        storage_used = GREATEST(0, storage_used - OLD.file_size)
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para contador de modelos
CREATE TRIGGER update_models_count_trigger
  AFTER INSERT OR DELETE ON models_3d
  FOR EACH ROW EXECUTE FUNCTION update_models_count();

-- Función para obtener estadísticas de admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_subscribers BIGINT,
  trial_users BIGINT,
  monthly_recurring_revenue NUMERIC,
  total_projects BIGINT,
  total_models BIGINT,
  churn_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) as active_subscribers,
    COUNT(DISTINCT CASE WHEN s.status = 'trialing' THEN s.user_id END) as trial_users,
    COALESCE(SUM(CASE 
      WHEN s.plan_id = 'starter' AND s.status = 'active' THEN 49
      WHEN s.plan_id = 'professional' AND s.status = 'active' THEN 99
      WHEN s.plan_id = 'enterprise' AND s.status = 'active' THEN 199
      ELSE 0
    END), 0) as monthly_recurring_revenue,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT m.id) as total_models,
    CASE 
      WHEN COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN s.status = 'canceled' AND s.updated_at > NOW() - INTERVAL '30 days' THEN s.user_id END)::NUMERIC / 
          NULLIF(COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END)::NUMERIC, 0)) * 100,
          2
        )
      ELSE 0
    END as churn_rate
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id
  LEFT JOIN projects p ON u.id = p.user_id
  LEFT JOIN models_3d m ON u.id = m.user_id;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar trials expirados
CREATE OR REPLACE FUNCTION cleanup_expired_trials()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET status = 'canceled'
  WHERE plan_id = 'free_trial'
  AND status = 'trialing'
  AND trial_end < NOW()
  AND trial_end IS NOT NULL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Vista para métricas rápidas
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing') as trial_subscriptions,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM models_3d) as total_models,
  (SELECT COALESCE(SUM(storage_used), 0) FROM usage_limits) as total_storage_used;

