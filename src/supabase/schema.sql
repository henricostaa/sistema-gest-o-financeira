-- ===================================================
-- ESQUEMA DO BANCO DE DADOS POSTGRESQL / SUPABASE
-- SISTEMA DE CONTROLE FINANCEIRO PESSOAL (PT-BR)
-- ===================================================

-- 1. EXTENSÃO UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1 TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL
-- Sempre que um novo usuário for cadastrado via Supabase Auth (auth.users),
-- esta função insere automaticamente uma linha na tabela public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa a função acima ao evento de inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'ambos')),
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT 'Tag',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE FORMAS DE PAGAMENTO
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE TRANSAÇÕES (LANÇAMENTOS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pago', 'pendente')),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  installments_count INTEGER DEFAULT 1,
  current_installment INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE ORÇAMENTO MENSAL
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  planned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year, category_id)
);

-- 7. TABELA DE DÍVIDAS (BOLA DE NEVE)
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  original_amount NUMERIC(12, 2) NOT NULL CHECK (original_amount >= 0),
  negotiated_discount NUMERIC(12, 2) DEFAULT 0.00,
  negotiated_amount NUMERIC(12, 2) DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('em_aberto', 'negociando', 'pagando', 'quitada')),
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HISTÓRICO DE PAGAMENTOS DE DÍVIDAS
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RESERVA DE EMERGÊNCIA
CREATE TABLE IF NOT EXISTS public.emergency_fund (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  monthly_planned_contribution NUMERIC(12, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_fund_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aporte', 'retirada')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. METAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount >= 0),
  current_amount NUMERIC(12, 2) DEFAULT 0.00,
  deadline DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'concluida', 'pausada')),
  priority TEXT NOT NULL CHECK (priority IN ('alta', 'media', 'baixa')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tithe_percentage NUMERIC(5, 2) DEFAULT 10.00,
  debt_clearance_target_date DATE DEFAULT '2026-12-31',
  currency TEXT DEFAULT 'BRL',
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_fund_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DA TABELA PROFILES
DROP POLICY IF EXISTS "Leitura de perfil proprietario" ON public.profiles;
CREATE POLICY "Leitura de perfil proprietario" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Atualizacao de perfil proprietario" ON public.profiles;
CREATE POLICY "Atualizacao de perfil proprietario" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insercao de perfil proprietario" ON public.profiles;
CREATE POLICY "Insercao de perfil proprietario" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS DAS DEMAIS TABELAS (Cada usuário só acessa seus próprios registros)
DROP POLICY IF EXISTS "Acesso categorias proprietário" ON public.categories;
CREATE POLICY "Acesso categorias proprietário" ON public.categories FOR ALL USING (auth.uid() = user_id OR is_default = TRUE);

DROP POLICY IF EXISTS "Acesso pagamentos proprietário" ON public.payment_methods;
CREATE POLICY "Acesso pagamentos proprietário" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso transações proprietário" ON public.transactions;
CREATE POLICY "Acesso transações proprietário" ON public.transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso orçamento proprietário" ON public.monthly_budgets;
CREATE POLICY "Acesso orçamento proprietário" ON public.monthly_budgets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso dívidas proprietário" ON public.debts;
CREATE POLICY "Acesso dívidas proprietário" ON public.debts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso metas proprietário" ON public.financial_goals;
CREATE POLICY "Acesso metas proprietário" ON public.financial_goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso reserva proprietário" ON public.emergency_fund;
CREATE POLICY "Acesso reserva proprietário" ON public.emergency_fund FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso configuracoes proprietário" ON public.settings;
CREATE POLICY "Acesso configuracoes proprietário" ON public.settings FOR ALL USING (auth.uid() = user_id);

