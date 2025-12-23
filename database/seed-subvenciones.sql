-- =============================================
-- SEED DE SUBVENCIONES ESPAÑOLAS PARA PATRIMONIO
-- Datos de ejemplo basados en convocatorias reales
-- =============================================

-- Limpiar datos anteriores (opcional)
-- DELETE FROM grants;

-- 1. MINISTERIO DE CULTURA - PROGRAMA 1,5% CULTURAL
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url, bases_url, application_url,
  required_documents, notes, tags
) VALUES (
  uuid_generate_v4(),
  'Programa 1,5% Cultural - Conservación del Patrimonio Histórico',
  'Ayudas para financiar trabajos de conservación o enriquecimiento del Patrimonio Histórico Español. Dirigido a obras de construcción, reforma o reparación de inmuebles declarados BIC o incluidos en el Inventario General.',
  'Ministerio de Cultura y Deporte',
  'ministerio',
  'nacional',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'arqueologico'],
  ARRAY['BIC'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion'],
  50000,
  2000000,
  100,
  '2025-01-15',
  '2025-03-15',
  '2025-06-30',
  '2026-12-31',
  2025,
  'active',
  'https://www.cultura.gob.es/servicios-al-ciudadano/catalogo/becas-ayudas-y-subvenciones/ayudas-y-subvenciones/patrimonio/uno-coma-cinco-cultural.html',
  'https://www.boe.es',
  'https://sede.cultura.gob.es',
  '[{"name": "Memoria técnica del proyecto", "description": "Descripción detallada de las intervenciones"}, {"name": "Presupuesto desglosado", "description": "Partidas y mediciones"}, {"name": "Declaración BIC", "description": "Certificado de protección del bien"}, {"name": "Proyecto básico o de ejecución", "description": "Firmado por técnico competente"}, {"name": "Licencia de obras", "description": "O justificante de solicitud"}]'::jsonb,
  'Una de las principales fuentes de financiación para patrimonio en España. Permite financiar hasta el 100% de obras de conservación.',
  ARRAY['restauracion', 'conservacion', 'BIC', 'nacional']
);

-- 2. JUNTA DE ANDALUCÍA - PATRIMONIO HISTÓRICO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvenciones para la conservación y restauración de bienes inmuebles del Patrimonio Histórico Andaluz',
  'Ayudas destinadas a la conservación, restauración y rehabilitación de bienes inmuebles integrantes del Patrimonio Histórico Andaluz inscritos en el Catálogo General.',
  'Consejería de Cultura y Patrimonio Histórico - Junta de Andalucía',
  'ccaa',
  'andalucia',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'arqueologico', 'industrial'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  10000,
  500000,
  80,
  '2025-02-01',
  '2025-04-30',
  '2025-09-30',
  '2027-06-30',
  2025,
  'active',
  'https://www.juntadeandalucia.es/cultura',
  '[{"name": "Proyecto de intervención", "description": "Redactado por técnico competente"}, {"name": "Certificado de inscripción en CGPHA", "description": "Catálogo General del Patrimonio Histórico Andaluz"}, {"name": "Licencia urbanística", "description": "O solicitud presentada"}, {"name": "Presupuesto de ejecución material", "description": "Desglosado por capítulos"}]'::jsonb,
  ARRAY['andalucia', 'restauracion', 'patrimonio']
);

-- 3. GENERALITAT DE CATALUNYA - PATRIMONI CULTURAL
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvencions per a la restauració de béns immobles del patrimoni cultural català',
  'Ajuts per a obres de conservació, restauració i millora de béns immobles declarats BCIN o BCIL a Catalunya.',
  'Departament de Cultura - Generalitat de Catalunya',
  'ccaa',
  'cataluna',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'industrial'],
  ARRAY['BIC', 'BRL'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  5000,
  300000,
  75,
  '2025-01-20',
  '2025-03-20',
  '2025-07-31',
  '2026-12-31',
  2025,
  'active',
  'https://cultura.gencat.cat',
  '[{"name": "Projecte tècnic", "description": "Signat per tècnic competent"}, {"name": "Declaració BCIN/BCIL", "description": "Certificat de protecció"}, {"name": "Pressupost detallat", "description": "Per partides"}]'::jsonb,
  ARRAY['cataluna', 'restauracio', 'patrimoni']
);

-- 4. COMUNIDAD DE MADRID - PATRIMONIO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Ayudas para la restauración de Bienes de Interés Cultural de la Comunidad de Madrid',
  'Subvenciones para actuaciones de conservación, restauración y rehabilitación en inmuebles declarados BIC en la Comunidad de Madrid.',
  'Consejería de Cultura, Turismo y Deporte - Comunidad de Madrid',
  'ccaa',
  'madrid',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil'],
  ARRAY['BIC'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  20000,
  400000,
  70,
  '2025-02-15',
  '2025-05-15',
  '2025-10-01',
  '2027-03-31',
  2025,
  'active',
  'https://www.comunidad.madrid/servicios/cultura',
  '[{"name": "Proyecto técnico", "description": "Visado por el colegio profesional"}, {"name": "Declaración BIC", "description": "Resolución de declaración"}, {"name": "Presupuesto", "description": "Desglosado"}, {"name": "Fotografías del estado actual", "description": "Documentación gráfica"}]'::jsonb,
  ARRAY['madrid', 'restauracion', 'BIC']
);

-- 5. CASTILLA Y LEÓN - PATRIMONIO ECLESIÁSTICO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Ayudas para conservación del patrimonio eclesiástico en Castilla y León',
  'Subvenciones destinadas a obras de conservación, restauración y rehabilitación de bienes inmuebles de titularidad eclesiástica que formen parte del patrimonio cultural de Castilla y León.',
  'Consejería de Cultura y Turismo - Junta de Castilla y León',
  'ccaa',
  'castilla_leon',
  ARRAY['iglesia'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['diocesis'],
  5000,
  200000,
  80,
  '2025-01-10',
  '2025-02-28',
  '2025-05-31',
  '2026-09-30',
  2025,
  'active',
  'https://cultura.jcyl.es',
  '[{"name": "Proyecto de intervención", "description": "Firmado por arquitecto"}, {"name": "Autorización eclesiástica", "description": "Del obispado correspondiente"}, {"name": "Ficha del inmueble", "description": "Con datos de protección"}, {"name": "Presupuesto", "description": "Con mediciones"}]'::jsonb,
  ARRAY['castilla_leon', 'iglesias', 'patrimonio_eclesiastico']
);

-- 6. GALICIA - PLAN CATEDRAIS
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Plan Catedrais - Conservación de catedrales y grandes templos de Galicia',
  'Ayudas específicas para la conservación y restauración de las catedrales gallegas y otros templos de especial relevancia arquitectónica.',
  'Xunta de Galicia - Consellería de Cultura',
  'ccaa',
  'galicia',
  ARRAY['iglesia'],
  ARRAY['BIC'],
  ARRAY['diocesis'],
  100000,
  1000000,
  90,
  '2025-03-01',
  '2025-05-31',
  '2025-09-30',
  '2027-12-31',
  2025,
  'active',
  'https://cultura.xunta.gal',
  '[{"name": "Proyecto de intervención", "description": "Redactado por arquitecto especialista"}, {"name": "Informe de estado de conservación", "description": "Firmado por técnico"}, {"name": "Plan de mantenimiento", "description": "Posterior a la intervención"}]'::jsonb,
  ARRAY['galicia', 'catedrales', 'iglesias']
);

-- 7. PAÍS VASCO - ONDARE PLANA
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Ondare Plana - Plan de Patrimonio Cultural Vasco',
  'Ayudas para la protección, conservación y difusión del patrimonio cultural del País Vasco, tanto material como inmaterial.',
  'Departamento de Cultura - Gobierno Vasco',
  'ccaa',
  'pais_vasco',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'industrial', 'arqueologico'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  10000,
  250000,
  75,
  '2025-02-01',
  '2025-04-15',
  '2025-07-31',
  '2026-12-31',
  2025,
  'active',
  'https://www.euskadi.eus/gobierno-vasco/departamento-cultura/',
  '[{"name": "Proiektua", "description": "Arkitekto eskudunak sinatua"}, {"name": "Babes maila", "description": "Ziurtagiria"}, {"name": "Aurrekontua", "description": "Xehatua"}]'::jsonb,
  ARRAY['pais_vasco', 'euskadi', 'ondarea']
);

-- 8. COMUNITAT VALENCIANA - PATRIMONIO CULTURAL
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvenciones para la conservación del patrimonio cultural inmueble valenciano',
  'Ayudas para intervenciones de conservación, restauración y rehabilitación de bienes inmuebles integrantes del patrimonio cultural valenciano.',
  'Conselleria de Educación, Cultura y Deporte - Generalitat Valenciana',
  'ccaa',
  'comunidad_valenciana',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'industrial'],
  ARRAY['BIC', 'BRL'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  15000,
  350000,
  70,
  '2025-01-15',
  '2025-03-31',
  '2025-06-30',
  '2026-12-31',
  2025,
  'active',
  'https://ceice.gva.es/es/web/patrimonio-cultural-y-museos',
  '[{"name": "Proyecto técnico", "description": "Visado"}, {"name": "Declaración BIC/BRL", "description": "Certificado"}, {"name": "Presupuesto desglosado", "description": "Por partidas"}]'::jsonb,
  ARRAY['valencia', 'patrimonio', 'restauracion']
);

-- 9. FONDOS NEXT GENERATION - PATRIMONIO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Plan de Recuperación - Componente 14: Conservación del Patrimonio',
  'Fondos europeos Next Generation para la rehabilitación y conservación del patrimonio histórico español. Línea de ayudas para actuaciones urgentes y proyectos de puesta en valor.',
  'Ministerio de Cultura y Deporte - Fondos Next Generation EU',
  'europeo',
  'nacional',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'arqueologico', 'industrial'],
  ARRAY['BIC', 'BRL'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion'],
  100000,
  5000000,
  100,
  '2025-01-01',
  '2025-06-30',
  '2025-12-31',
  '2026-12-31',
  2025,
  'active',
  'https://planderecuperacion.gob.es',
  '[{"name": "Proyecto de intervención", "description": "Completo con memoria, planos y presupuesto"}, {"name": "Declaración de protección", "description": "BIC o BRL"}, {"name": "Plan de sostenibilidad", "description": "Criterios medioambientales"}, {"name": "Plan de digitalización", "description": "Documentación 3D si aplica"}, {"name": "Estudio de viabilidad económica", "description": "Plan de uso posterior"}]'::jsonb,
  ARRAY['next_generation', 'europeo', 'recuperacion']
);

-- 10. DIPUTACIÓN DE BARCELONA - PATRIMONIO LOCAL
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, province, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvencions per a la conservació del patrimoni arquitectònic local',
  'Ajuts als municipis de la demarcació de Barcelona per a obres de conservació del patrimoni arquitectònic d''interès local.',
  'Diputació de Barcelona - Àrea de Cultura',
  'diputacion',
  'cataluna',
  'Barcelona',
  ARRAY['iglesia', 'monumento', 'civil'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['ayuntamiento'],
  5000,
  100000,
  80,
  '2025-02-01',
  '2025-03-31',
  '2025-06-30',
  '2026-06-30',
  2025,
  'active',
  'https://www.diba.cat/es/web/cultura',
  '[{"name": "Sol·licitud normalitzada", "description": "Formulari oficial"}, {"name": "Projecte d''intervenció", "description": "Amb pressupost"}, {"name": "Acord del ple municipal", "description": "Aprovació de l''ajuntament"}]'::jsonb,
  ARRAY['barcelona', 'diputacion', 'local']
);

-- 11. ARAGÓN - PATRIMONIO ARQUITECTÓNICO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Ayudas para la conservación del patrimonio arquitectónico aragonés',
  'Subvenciones para intervenciones de conservación y restauración de bienes inmuebles del patrimonio cultural aragonés.',
  'Departamento de Educación, Cultura y Deporte - Gobierno de Aragón',
  'ccaa',
  'aragon',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  10000,
  200000,
  70,
  '2025-02-15',
  '2025-04-30',
  '2025-08-31',
  '2026-12-31',
  2025,
  'active',
  'https://www.aragon.es/organismos/departamento-de-educacion-cultura-y-deporte',
  '[{"name": "Proyecto técnico", "description": "Firmado por técnico competente"}, {"name": "Declaración del bien", "description": "BIC, BRL o inventariado"}, {"name": "Presupuesto detallado", "description": "Con mediciones"}]'::jsonb,
  ARRAY['aragon', 'patrimonio', 'arquitectura']
);

-- 12. FUNDACIÓN HISPANIA NOSTRA
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Premios Hispania Nostra a las Buenas Prácticas en Conservación del Patrimonio',
  'Reconocimiento y ayuda económica a proyectos ejemplares de conservación del patrimonio cultural y natural español. Incluye dotación económica para proyectos de mantenimiento.',
  'Fundación Hispania Nostra',
  'fundacion',
  'nacional',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'industrial', 'arqueologico', 'natural'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal', 'sin_proteccion'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular', 'empresa'],
  5000,
  30000,
  null,
  '2025-01-01',
  '2025-02-28',
  '2025-05-15',
  '2025-12-31',
  2025,
  'active',
  'https://hispanianostra.org',
  '[{"name": "Memoria del proyecto", "description": "Descripción de la intervención realizada o propuesta"}, {"name": "Documentación gráfica", "description": "Fotografías antes/después"}, {"name": "Presupuesto o coste de la intervención", "description": "Desglose económico"}]'::jsonb,
  ARRAY['premios', 'fundacion', 'buenas_practicas']
);

-- 13. EXTREMADURA - CONSERVACIÓN PATRIMONIO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvenciones para la conservación del patrimonio histórico-artístico extremeño',
  'Ayudas para obras de conservación, restauración y rehabilitación de bienes inmuebles del patrimonio cultural extremeño.',
  'Consejería de Cultura, Turismo y Deportes - Junta de Extremadura',
  'ccaa',
  'extremadura',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil', 'arqueologico'],
  ARRAY['BIC', 'BRL'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  8000,
  150000,
  75,
  '2025-03-01',
  '2025-05-15',
  '2025-09-30',
  '2026-12-31',
  2025,
  'active',
  'https://www.juntaex.es/w/cultura',
  '[{"name": "Proyecto de intervención", "description": "Firmado por técnico"}, {"name": "Certificado de protección", "description": "BIC o BRL"}, {"name": "Presupuesto", "description": "Desglosado por capítulos"}]'::jsonb,
  ARRAY['extremadura', 'patrimonio', 'conservacion']
);

-- 14. CANARIAS - PATRIMONIO HISTÓRICO
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Subvenciones para la conservación del patrimonio histórico de Canarias',
  'Ayudas para actuaciones de conservación y restauración en bienes inmuebles integrantes del patrimonio histórico de las Islas Canarias.',
  'Consejería de Educación, Universidades, Cultura y Deportes - Gobierno de Canarias',
  'ccaa',
  'canarias',
  ARRAY['iglesia', 'monumento', 'civil', 'arqueologico'],
  ARRAY['BIC', 'BRL'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  10000,
  180000,
  70,
  '2025-02-01',
  '2025-04-30',
  '2025-08-31',
  '2026-12-31',
  2025,
  'active',
  'https://www.gobiernodecanarias.org/cultura/',
  '[{"name": "Proyecto de intervención", "description": "Visado por el colegio"}, {"name": "Declaración del bien", "description": "BIC o bien catalogado"}, {"name": "Presupuesto", "description": "Con mediciones detalladas"}]'::jsonb,
  ARRAY['canarias', 'patrimonio', 'islas']
);

-- 15. MURCIA - PATRIMONIO CULTURAL
INSERT INTO grants (
  id, name, description, organization, organization_type,
  region, heritage_types, protection_levels, eligible_beneficiaries,
  min_amount, max_amount, funding_percentage,
  call_open_date, call_close_date, resolution_date, execution_deadline,
  year, status, official_url,
  required_documents, tags
) VALUES (
  uuid_generate_v4(),
  'Ayudas para la conservación del patrimonio cultural de la Región de Murcia',
  'Subvenciones destinadas a la conservación, restauración y rehabilitación de bienes inmuebles del patrimonio cultural murciano.',
  'Consejería de Educación y Cultura - Región de Murcia',
  'ccaa',
  'murcia',
  ARRAY['iglesia', 'castillo', 'monumento', 'civil'],
  ARRAY['BIC', 'BRL', 'catalogo_municipal'],
  ARRAY['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
  5000,
  120000,
  65,
  '2025-02-15',
  '2025-04-15',
  '2025-07-31',
  '2026-06-30',
  2025,
  'active',
  'https://www.carm.es/web/pagina?IDCONTENIDO=62&IDTIPO=140',
  '[{"name": "Proyecto técnico", "description": "Con memoria y planos"}, {"name": "Certificado de inscripción", "description": "En el catálogo de patrimonio"}, {"name": "Presupuesto desglosado", "description": "Por partidas"}]'::jsonb,
  ARRAY['murcia', 'patrimonio', 'cultural']
);

-- Verificar inserción
SELECT COUNT(*) as total_subvenciones FROM grants WHERE status = 'active';

