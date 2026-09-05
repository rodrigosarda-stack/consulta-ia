-- =====================================================================
-- MarIA (consulta-ia) — SCHEMA DO BANCO
-- Projeto Supabase: maria-ia (xzknmihhtgwggpndpivb) · região sa-east-1
--
-- Extraído do banco EM PRODUÇÃO em 05/09/2026, direto do catálogo do
-- Postgres. NÃO é reconstrução por dedução: cada linha abaixo veio de
-- pg_get_constraintdef / pg_get_functiondef / pg_get_triggerdef / pg_indexes.
--
-- POR QUE ESTE ARQUIVO EXISTE: o schema foi criado à mão em abril/2026,
-- direto no editor SQL, e nunca havia sido versionado. Vivia num lugar só.
-- Em 05/09 isso quase custou caro — ver docs/incidente-2026-09-05.md.
--
-- ⚠️ SEGREDOS REMOVIDOS: os valores reais de `cron_secret`, do secret na URL
-- do cron e das credenciais do Evolution API estão no banco e no painel do
-- Supabase, NÃO aqui. Onde aparecem, estão como <REDACTED>.
--
-- Ordem de aplicação num banco vazio: extensões → tipos → tabelas →
-- constraints → índices → funções → gatilhos → RLS → storage → cron.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSÕES
-- ---------------------------------------------------------------------
create extension if not exists pgmq;      -- 1.5.1 — fila consultas_queue
create extension if not exists pg_cron;   -- 1.6.4 — agendamentos
create extension if not exists pg_net;    -- 0.20.0 — cron chama a Edge Function

-- ---------------------------------------------------------------------
-- 2. TIPOS
-- ---------------------------------------------------------------------
create type consulta_status  as enum ('uploaded', 'queued', 'processing', 'done', 'failed');
create type credito_tipo     as enum ('uso', 'reset_diario', 'trial', 'boost', 'plano_upgrade');
create type pagamento_status as enum ('pending', 'paid', 'failed', 'cancelled');
create type plano_tipo       as enum ('free', 'maria', 'cerebro');

-- ---------------------------------------------------------------------
-- 3. TABELAS  (13)
-- ---------------------------------------------------------------------

-- O profissional de saúde. Chave é o telefone normalizado (+55DDNNNNNNNNN).
create table if not exists usuarios (
  telefone text not null,
  nome text,
  email text,
  especialidade text,
  plano plano_tipo default 'free'::plano_tipo not null,
  trial_inicio timestamp with time zone,
  trial_fim timestamp with time zone,
  creditos_hoje integer default 3 not null,
  storage_usado_bytes bigint default 0 not null,
  onboarding_ok boolean default false not null,
  termos_aceitos timestamp with time zone,          -- consentimento LGPD
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  device_id text,                                    -- anti-abuso
  trial_bloqueado boolean default false not null,
  uid uuid default gen_random_uuid(),                -- pasta do áudio no storage
  conselho text,
  conselho_numero text,
  conselho_uf text,
  validado boolean default false
);

-- Token de uso único mandado pelo bot no link do gravador.
create table if not exists auth_tokens (
  token text default encode(gen_random_bytes(32), 'hex'::text) not null,
  telefone text not null,
  expires_at timestamp with time zone default (now() + '24:00:00'::interval) not null,
  used boolean default false not null,
  created_at timestamp with time zone default now() not null
);

-- Sessão do navegador, trocada pelo auth_token.
create table if not exists session_tokens (
  token text default encode(gen_random_bytes(32), 'hex'::text) not null,
  telefone text not null,
  expires_at timestamp with time zone default (now() + '24:00:00'::interval) not null,
  created_at timestamp with time zone default now() not null
);

-- Uma gravação. Nasce 'uploaded'; o gatilho enqueue_consulta põe na fila.
create table if not exists consultas (
  id uuid default gen_random_uuid() not null,
  usuario_tel text not null,
  paciente_nome text,
  audio_path text,
  audio_size_bytes bigint,
  duracao_seg integer,
  status consulta_status default 'uploaded'::consulta_status not null,
  tentativas integer default 0 not null,             -- vira 'failed' em 5
  erro text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  paciente_tel text,
  is_saude boolean default true,
  classificacao text                                 -- consulta_saude|nao_saude|incerto
);

-- O resultado. fts alimenta a busca em português do painel.
create table if not exists prontuarios (
  id uuid default gen_random_uuid() not null,
  consulta_id uuid not null,
  usuario_tel text not null,
  paciente_nome text,
  transcricao text,
  prontuario jsonb,
  prontuario_texto text,
  enviado_wa boolean default false not null,
  enviado_email boolean default false not null,
  created_at timestamp with time zone default now() not null,
  fts tsvector generated always as (
    to_tsvector('portuguese'::regconfig,
      ((((COALESCE(paciente_nome, ''::text) || ' '::text) || COALESCE(transcricao, ''::text))
        || ' '::text) || COALESCE(prontuario_texto, ''::text)))
  ) stored,
  paciente_tel text
);

create table if not exists assinaturas (
  id integer default nextval('assinaturas_id_seq'::regclass) not null,
  usuario_tel text not null,
  plano plano_tipo not null,
  provider text default 'asaas'::text not null,
  provider_subscription_id text,
  provider_customer_id text,
  valor_cents integer not null,
  status text default 'pending'::text not null,
  periodo_inicio date,
  periodo_fim date,
  cancelado_em timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists pagamentos (
  id integer default nextval('pagamentos_id_seq'::regclass) not null,
  usuario_tel text not null,
  provider text,
  provider_id text,
  plano plano_tipo not null,
  valor_cents integer not null,
  status pagamento_status default 'pending'::pagamento_status not null,
  periodo_inicio date,
  periodo_fim date,
  created_at timestamp with time zone default now() not null
);

create table if not exists creditos_log (
  id integer default nextval('creditos_log_id_seq'::regclass) not null,
  usuario_tel text not null,
  tipo credito_tipo not null,
  delta integer not null,
  saldo_apos integer not null,
  detalhes text,
  created_at timestamp with time zone default now() not null
);

create table if not exists indicacoes (
  id integer default nextval('indicacoes_id_seq'::regclass) not null,
  indicador_tel text not null,
  indicado_tel text not null,
  indicado_testou boolean default false not null,
  boost_creditado boolean default false not null,
  created_at timestamp with time zone default now() not null
);

-- Anti-abuso: quantas contas por aparelho, e se já usou o trial.
create table if not exists devices (
  device_id text not null,
  contas_criadas integer default 1 not null,
  primeiro_uso timestamp with time zone default now() not null,
  ultimo_uso timestamp with time zone default now() not null,
  trial_usado boolean default true not null
);

create table if not exists signup_ips (
  ip text not null,
  telefone text not null,
  created_at timestamp with time zone default now() not null
);

-- Cache de 30 dias das consultas ao CFM/CFO.
create table if not exists validacoes_profissionais (
  id integer default nextval('validacoes_profissionais_id_seq'::regclass) not null,
  telefone text,
  conselho text not null,
  numero text not null,
  uf text not null,
  nome_registrado text,
  especialidade text,
  situacao text,
  validado boolean default false not null,
  validado_em timestamp with time zone,
  metodo text,                                       -- cfm_scraping | cfo_scraping
  created_at timestamp with time zone default now() not null
);

-- Parâmetros operacionais (ver seed no fim do arquivo).
create table if not exists config (
  chave text not null,
  valor jsonb not null,
  updated_at timestamp with time zone default now() not null
);

-- ---------------------------------------------------------------------
-- 4. CONSTRAINTS
-- ---------------------------------------------------------------------
alter table usuarios                 add constraint usuarios_pkey PRIMARY KEY (telefone);
alter table auth_tokens              add constraint auth_tokens_pkey PRIMARY KEY (token);
alter table session_tokens           add constraint session_tokens_pkey PRIMARY KEY (token);
alter table consultas                add constraint consultas_pkey PRIMARY KEY (id);
alter table prontuarios              add constraint prontuarios_pkey PRIMARY KEY (id);
alter table assinaturas              add constraint assinaturas_pkey PRIMARY KEY (id);
alter table pagamentos               add constraint pagamentos_pkey PRIMARY KEY (id);
alter table creditos_log             add constraint creditos_log_pkey PRIMARY KEY (id);
alter table indicacoes               add constraint indicacoes_pkey PRIMARY KEY (id);
alter table devices                  add constraint devices_pkey PRIMARY KEY (device_id);
alter table validacoes_profissionais add constraint validacoes_profissionais_pkey PRIMARY KEY (id);
alter table config                   add constraint config_pkey PRIMARY KEY (chave);

alter table auth_tokens              add constraint auth_tokens_telefone_fkey FOREIGN KEY (telefone) REFERENCES usuarios(telefone);
alter table consultas                add constraint consultas_usuario_tel_fkey FOREIGN KEY (usuario_tel) REFERENCES usuarios(telefone);
alter table prontuarios              add constraint prontuarios_consulta_id_fkey FOREIGN KEY (consulta_id) REFERENCES consultas(id);
alter table prontuarios              add constraint prontuarios_usuario_tel_fkey FOREIGN KEY (usuario_tel) REFERENCES usuarios(telefone);
alter table assinaturas              add constraint assinaturas_usuario_tel_fkey FOREIGN KEY (usuario_tel) REFERENCES usuarios(telefone);
alter table pagamentos               add constraint pagamentos_usuario_tel_fkey FOREIGN KEY (usuario_tel) REFERENCES usuarios(telefone);
alter table creditos_log             add constraint creditos_log_usuario_tel_fkey FOREIGN KEY (usuario_tel) REFERENCES usuarios(telefone);
alter table indicacoes               add constraint indicacoes_indicador_tel_fkey FOREIGN KEY (indicador_tel) REFERENCES usuarios(telefone);
alter table indicacoes               add constraint indicacoes_indicado_tel_fkey FOREIGN KEY (indicado_tel) REFERENCES usuarios(telefone);
alter table signup_ips               add constraint signup_ips_telefone_fkey FOREIGN KEY (telefone) REFERENCES usuarios(telefone);
alter table validacoes_profissionais add constraint validacoes_profissionais_telefone_fkey FOREIGN KEY (telefone) REFERENCES usuarios(telefone);

-- ---------------------------------------------------------------------
-- 5. ÍNDICES
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX idx_usuarios_uid ON public.usuarios USING btree (uid);
CREATE INDEX idx_usuarios_device ON public.usuarios USING btree (device_id) WHERE (device_id IS NOT NULL);
CREATE INDEX idx_auth_tokens_telefone ON public.auth_tokens USING btree (telefone);
CREATE INDEX idx_auth_tokens_expires ON public.auth_tokens USING btree (expires_at);
CREATE INDEX idx_session_tokens_expires ON public.session_tokens USING btree (expires_at);
CREATE INDEX idx_consultas_status ON public.consultas USING btree (status);
CREATE INDEX idx_consultas_usuario ON public.consultas USING btree (usuario_tel);
CREATE INDEX idx_consultas_paciente ON public.consultas USING btree (usuario_tel, paciente_nome);
CREATE INDEX idx_prontuarios_fts ON public.prontuarios USING gin (fts);
CREATE INDEX idx_prontuarios_consulta ON public.prontuarios USING btree (consulta_id);
CREATE INDEX idx_prontuarios_usuario ON public.prontuarios USING btree (usuario_tel);
CREATE INDEX idx_prontuarios_paciente ON public.prontuarios USING btree (usuario_tel, paciente_nome);
CREATE INDEX idx_assinaturas_tel ON public.assinaturas USING btree (usuario_tel);
CREATE INDEX idx_assinaturas_status ON public.assinaturas USING btree (status);
CREATE INDEX idx_pagamentos_usuario ON public.pagamentos USING btree (usuario_tel);
CREATE INDEX idx_creditos_usuario ON public.creditos_log USING btree (usuario_tel);
CREATE INDEX idx_indicacoes_indicador ON public.indicacoes USING btree (indicador_tel);
CREATE INDEX idx_indicacoes_indicado ON public.indicacoes USING btree (indicado_tel);
CREATE INDEX idx_signup_ips_ip ON public.signup_ips USING btree (ip);
CREATE INDEX idx_signup_ips_created ON public.signup_ips USING btree (created_at);
CREATE INDEX idx_validacoes_conselho ON public.validacoes_profissionais USING btree (conselho, numero, uf);
CREATE INDEX idx_validacoes_tel ON public.validacoes_profissionais USING btree (telefone);

-- ---------------------------------------------------------------------
-- 6. FUNÇÕES
-- ---------------------------------------------------------------------

-- Normaliza telefone BR pra +55DD9XXXXXXXX. É a base de tudo: todo telefone
-- que entra em qualquer tabela passa por aqui via gatilho.
CREATE OR REPLACE FUNCTION public.normalize_br_phone(phone text)
 RETURNS text LANGUAGE plpgsql IMMUTABLE
AS $function$
DECLARE
  digits text;
BEGIN
  -- Remove tudo que NÃO é dígito
  digits := regexp_replace(phone, '[^0-9]', '', 'g');

  -- Caso: 13 dígitos (55 + DDD + 9 dígitos) → remove 55
  IF length(digits) = 13 AND substring(digits from 1 for 2) = '55' THEN
    digits := substring(digits from 3);  -- fica 11
  END IF;

  -- Caso: 12 dígitos (55 + DDD + 8 dígitos sem 9º) → remove 55, adiciona 9
  IF length(digits) = 12 AND substring(digits from 1 for 2) = '55' THEN
    digits := substring(digits from 3);  -- fica 10
  END IF;

  -- Caso: 10 dígitos (DDD + 8 dígitos sem 9º) → adiciona 9 após DDD
  IF length(digits) = 10 THEN
    digits := substring(digits from 1 for 2) || '9' || substring(digits from 3);  -- fica 11
  END IF;

  -- Resultado esperado: sempre 11 dígitos (DDD + 9 + 8 dígitos)
  RETURN '+55' || digits;
END;
$function$;

-- Chamada por whatsapp-webhook: cria usuário se não existe e devolve token.
CREATE OR REPLACE FUNCTION public.generate_auth_token(tel text)
 RETURNS text LANGUAGE plpgsql
AS $function$
DECLARE
  new_token text;
  normalized_tel text;
BEGIN
  normalized_tel := normalize_br_phone(tel);

  -- Cria usuário se não existe
  INSERT INTO usuarios (telefone)
  VALUES (normalized_tel)
  ON CONFLICT (telefone) DO NOTHING;

  -- Gera token
  INSERT INTO auth_tokens (telefone)
  VALUES (normalized_tel)
  RETURNING token INTO new_token;

  RETURN new_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_auth_token(t text)
 RETURNS TABLE(telefone text, plano plano_tipo, valid boolean) LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.telefone,
    u.plano,
    (at.token IS NOT NULL AND at.expires_at > now()) AS valid
  FROM auth_tokens at
  JOIN usuarios u ON u.telefone = at.telefone
  WHERE at.token = t
  LIMIT 1;
END;
$function$;

-- Chamada por process-consultation ao terminar.
CREATE OR REPLACE FUNCTION public.increment_storage(tel text, bytes bigint)
 RETURNS void LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE usuarios
  SET storage_usado_bytes = storage_usado_bytes + bytes
  WHERE telefone = normalize_br_phone(tel);
END;
$function$;

-- ESTE é o mecanismo uploaded→queued: põe na fila pgmq e muda o status.
CREATE OR REPLACE FUNCTION public.enqueue_consulta()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'uploaded' THEN
    PERFORM pgmq.send('consultas_queue', jsonb_build_object(
      'consulta_id', NEW.id,
      'usuario_tel', NEW.usuario_tel,
      'audio_path', NEW.audio_path,
      'paciente_nome', NEW.paciente_nome
    ));
    NEW.status := 'queued';
  END IF;
  RETURN NEW;
END;
$function$;

-- Teto de abuso: 200 consultas por dia por usuário.
CREATE OR REPLACE FUNCTION public.check_daily_limit()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
DECLARE
  count_today int;
BEGIN
  SELECT COUNT(*) INTO count_today
  FROM consultas
  WHERE usuario_tel = NEW.usuario_tel
  AND created_at >= (now() AT TIME ZONE 'America/Sao_Paulo')::date::timestamptz;

  IF count_today >= 200 THEN
    RAISE EXCEPTION 'Limite diario de 200 consultas atingido';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Gatilhos de normalização de telefone, um por tabela.
CREATE OR REPLACE FUNCTION public.tr_normalize_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.telefone := normalize_br_phone(NEW.telefone); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_consulta_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.usuario_tel := normalize_br_phone(NEW.usuario_tel); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_prontuario_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.usuario_tel := normalize_br_phone(NEW.usuario_tel); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_credito_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.usuario_tel := normalize_br_phone(NEW.usuario_tel); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_pagamento_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.usuario_tel := normalize_br_phone(NEW.usuario_tel); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_signup_ip_phone() RETURNS trigger LANGUAGE plpgsql
AS $function$ BEGIN NEW.telefone := normalize_br_phone(NEW.telefone); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.tr_normalize_indicacao_phones() RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.indicador_tel := normalize_br_phone(NEW.indicador_tel);
  NEW.indicado_tel := normalize_br_phone(NEW.indicado_tel);
  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------
-- 7. GATILHOS
-- ---------------------------------------------------------------------
CREATE TRIGGER tr_usuarios_normalize_phone BEFORE INSERT OR UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION tr_normalize_phone();
CREATE TRIGGER tr_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_consultas_normalize_phone BEFORE INSERT OR UPDATE ON public.consultas FOR EACH ROW EXECUTE FUNCTION tr_normalize_consulta_phone();
CREATE TRIGGER tr_consultas_updated_at BEFORE UPDATE ON public.consultas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_check_daily_limit BEFORE INSERT ON public.consultas FOR EACH ROW EXECUTE FUNCTION check_daily_limit();
CREATE TRIGGER tr_enqueue_consulta BEFORE INSERT ON public.consultas FOR EACH ROW EXECUTE FUNCTION enqueue_consulta();
CREATE TRIGGER tr_prontuarios_normalize_phone BEFORE INSERT OR UPDATE ON public.prontuarios FOR EACH ROW EXECUTE FUNCTION tr_normalize_prontuario_phone();
CREATE TRIGGER tr_assinaturas_updated_at BEFORE UPDATE ON public.assinaturas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_pagamentos_normalize_phone BEFORE INSERT OR UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION tr_normalize_pagamento_phone();
CREATE TRIGGER tr_creditos_normalize_phone BEFORE INSERT OR UPDATE ON public.creditos_log FOR EACH ROW EXECUTE FUNCTION tr_normalize_credito_phone();
CREATE TRIGGER tr_indicacoes_normalize_phone BEFORE INSERT OR UPDATE ON public.indicacoes FOR EACH ROW EXECUTE FUNCTION tr_normalize_indicacao_phones();
CREATE TRIGGER tr_signup_ips_normalize_phone BEFORE INSERT OR UPDATE ON public.signup_ips FOR EACH ROW EXECUTE FUNCTION tr_normalize_signup_ip_phone();

-- ---------------------------------------------------------------------
-- 8. RLS — tudo fechado; só service_role entra (as Edge Functions).
--     Exceção: config é legível por qualquer um (só parâmetros públicos).
-- ---------------------------------------------------------------------
alter table usuarios                 enable row level security;
alter table auth_tokens              enable row level security;
alter table session_tokens           enable row level security;
alter table consultas                enable row level security;
alter table prontuarios              enable row level security;
alter table assinaturas              enable row level security;
alter table pagamentos               enable row level security;
alter table creditos_log             enable row level security;
alter table indicacoes               enable row level security;
alter table devices                  enable row level security;
alter table signup_ips               enable row level security;
alter table validacoes_profissionais enable row level security;
alter table config                   enable row level security;

create policy service_role_all on usuarios                 for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on auth_tokens              for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on session_tokens           for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on consultas                for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on prontuarios              for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on assinaturas              for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on pagamentos               for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on creditos_log             for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on indicacoes               for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on devices                  for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on signup_ips               for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on validacoes_profissionais for ALL to public using ((auth.role() = 'service_role'::text));
create policy service_role_all on config                   for ALL to public using ((auth.role() = 'service_role'::text));
create policy config_read      on config                   for SELECT to public using (true);

-- ---------------------------------------------------------------------
-- 9. STORAGE — bucket privado dos áudios (100 MB por arquivo)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('audios', 'audios', false, 104857600)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 10. FILA + AGENDAMENTOS
-- ---------------------------------------------------------------------
select pgmq.create('consultas_queue');

-- A cada minuto, chama a Edge Function que consome a fila.
-- ⚠️ o secret real está no banco (config.cron_secret) e no painel.
select cron.schedule('process_consultas_queue', '* * * * *', $$
  SELECT net.http_post(
    url := 'https://xzknmihhtgwggpndpivb.supabase.co/functions/v1/process-consultation?secret=<REDACTED>'
  );
$$);

-- 3h da manhã: devolve os créditos diários de quem está no plano free.
select cron.schedule('reset_creditos_diarios', '0 3 * * *', $$
  UPDATE usuarios SET creditos_hoje = 3
  WHERE plano = 'free' AND (trial_fim IS NULL OR trial_fim < now());
$$);

-- 4h da manhã: limpa tokens vencidos.
select cron.schedule('cleanup_expired_sessions', '0 4 * * *', $$
  DELETE FROM session_tokens WHERE expires_at < now();
  DELETE FROM auth_tokens WHERE expires_at < now();
$$);

-- ---------------------------------------------------------------------
-- 11. CONFIG — parâmetros operacionais (valores de 05/09/2026)
-- ---------------------------------------------------------------------
insert into config (chave, valor) values
  ('versao',           '"1.0.0"'),
  ('trial_dias',       '3'),
  ('boost_dias',       '3'),
  ('anti_abuso',       '{"max_contas_por_device": 2, "max_trials_por_device": 1, "max_contas_por_ip_semana": 3}'),
  ('creditos_diarios', '{"max_contas_por_device": 2, "max_contas_por_ip_semana": 3}'),
  ('storage_limits',   '{"free": 1073741824, "maria": 53687091200, "cerebro": 188978561024}'),
  ('evolution_api',    '{"server_url": "https://evo.metodo3amedico.com.br", "instance_name": "MarIA-Bot", "apikey": "<REDACTED>"}'),
  ('cron_secret',      '"<REDACTED>"')
on conflict (chave) do nothing;
