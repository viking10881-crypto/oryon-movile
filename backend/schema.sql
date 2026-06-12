-- ============================================================
-- ORYON360 — Schema PostgreSQL (Neon DB)
-- Ejecutar en el SQL Editor de Neon Console
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan          VARCHAR(50)  DEFAULT 'free',   -- 'free' | 'premium'
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── ACCOUNTS (cuentas bancarias) ─────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  type       VARCHAR(50)  NOT NULL,   -- 'checking' | 'savings' | 'investment'
  balance    DECIMAL(15,2) DEFAULT 0,
  currency   VARCHAR(3)   DEFAULT 'USD',
  color      VARCHAR(7)   DEFAULT '#1B3A4B',
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(20)  NOT NULL,   -- 'income' | 'expense'
  icon       VARCHAR(50),
  color      VARCHAR(7),
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES users(id) ON DELETE CASCADE,
  account_id  UUID         REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID         REFERENCES categories(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  amount      DECIMAL(15,2) NOT NULL,   -- positivo=ingreso, negativo=gasto
  type        VARCHAR(20)  NOT NULL,    -- 'income' | 'expense' | 'transfer'
  status      VARCHAR(20)  DEFAULT 'Completado',  -- 'Completado' | 'Pendiente' | 'Recurrente'
  date        TIMESTAMPTZ  DEFAULT NOW(),
  notes       TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── DEBTS (préstamos / pasivos) ──────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID         REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  total_amount     DECIMAL(15,2) NOT NULL,
  remaining_amount DECIMAL(15,2) NOT NULL,
  monthly_payment  DECIMAL(15,2),
  interest_rate    DECIMAL(5,2),
  due_date         DATE,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── TASKS (agenda) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID         REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  priority     VARCHAR(20)  DEFAULT 'PERSONAL',  -- 'ALTA' | 'REUNIÓN' | 'FINANZAS' | 'PERSONAL'
  due_date     TIMESTAMPTZ,
  is_completed BOOLEAN      DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── EVENTS (próximos eventos en agenda) ──────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ  NOT NULL,
  type        VARCHAR(50),
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id        ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date       ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id     ON accounts(user_id);

-- ─── FUNCIÓN updated_at automático ───────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
