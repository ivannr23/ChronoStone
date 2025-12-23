-- Funciones auxiliares para Patrimonio Digital

-- Función para incrementar contadores de uso
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_field TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE usage_limits SET %I = %I + $1 WHERE user_id = $2',
    p_field, p_field
  )
  USING p_amount, p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar contadores de uso
CREATE OR REPLACE FUNCTION decrement_usage(
  p_user_id UUID,
  p_field TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE usage_limits SET %I = GREATEST(0, %I - $1) WHERE user_id = $2',
    p_field, p_field
  )
  USING p_amount, p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar contador de proyectos al crear uno nuevo
CREATE OR REPLACE FUNCTION update_projects_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_usage(NEW.user_id, 'projects_count', 1);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_usage(OLD.user_id, 'projects_count', 1);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contador de proyectos
DROP TRIGGER IF EXISTS update_projects_count_trigger ON projects;
CREATE TRIGGER update_projects_count_trigger
  AFTER INSERT OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_projects_count();

-- Función para actualizar contador de modelos 3D
CREATE OR REPLACE FUNCTION update_models_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_usage(NEW.user_id, 'models_3d_count', 1);
    -- También actualizar storage_used
    UPDATE usage_limits 
    SET storage_used = storage_used + NEW.file_size 
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_usage(OLD.user_id, 'models_3d_count', 1);
    -- También actualizar storage_used
    UPDATE usage_limits 
    SET storage_used = GREATEST(0, storage_used - OLD.file_size)
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contador de modelos
DROP TRIGGER IF EXISTS update_models_count_trigger ON models_3d;
CREATE TRIGGER update_models_count_trigger
  AFTER INSERT OR DELETE ON models_3d
  FOR EACH ROW EXECUTE FUNCTION update_models_count();

-- Función para verificar si un usuario ha excedido su límite
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id UUID,
  p_limit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current INTEGER;
  v_limit INTEGER;
  v_plan_id TEXT;
BEGIN
  -- Obtener el plan del usuario
  SELECT plan_id INTO v_plan_id
  FROM subscriptions
  WHERE user_id = p_user_id
  AND status IN ('active', 'trialing')
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Obtener uso actual
  IF p_limit_type = 'projects' THEN
    SELECT projects_count INTO v_current
    FROM usage_limits
    WHERE user_id = p_user_id;
    
    -- Determinar límite según plan
    CASE v_plan_id
      WHEN 'free_trial' THEN v_limit := 1;
      WHEN 'starter' THEN v_limit := 5;
      ELSE v_limit := NULL; -- ilimitado para professional y enterprise
    END CASE;
    
  ELSIF p_limit_type = 'models' THEN
    SELECT models_3d_count INTO v_current
    FROM usage_limits
    WHERE user_id = p_user_id;
    
    CASE v_plan_id
      WHEN 'free_trial' THEN v_limit := 3;
      ELSE v_limit := NULL; -- ilimitado para planes pagos
    END CASE;
  END IF;

  -- Si el límite es NULL (ilimitado), siempre permitir
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Verificar si está dentro del límite
  RETURN v_current < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar datos de prueba expirados (ejecutar con cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_trials()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Marcar suscripciones de prueba expiradas
  UPDATE subscriptions
  SET status = 'canceled'
  WHERE plan_id = 'free_trial'
  AND status = 'trialing'
  AND trial_end < NOW()
  AND trial_end IS NOT NULL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) as active_subscribers,
    COUNT(DISTINCT CASE WHEN s.status = 'trialing' THEN s.user_id END) as trial_users,
    COALESCE(SUM(CASE 
      WHEN s.plan_id = 'starter' AND s.status = 'active' THEN 49
      WHEN s.plan_id = 'professional' AND s.status = 'active' THEN 99
      WHEN s.plan_id = 'enterprise' AND s.status = 'active' THEN 199
      ELSE 0
    END), 0) as monthly_recurring_revenue,
    COUNT(DISTINCT proj.id) as total_projects,
    COUNT(DISTINCT m.id) as total_models,
    CASE 
      WHEN COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN s.status = 'canceled' AND s.updated_at > NOW() - INTERVAL '30 days' THEN s.user_id END)::NUMERIC / 
          COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END)::NUMERIC) * 100,
          2
        )
      ELSE 0
    END as churn_rate
  FROM profiles p
  LEFT JOIN subscriptions s ON p.id = s.user_id
  LEFT JOIN projects proj ON p.id = proj.user_id
  LEFT JOIN models_3d m ON p.id = m.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

