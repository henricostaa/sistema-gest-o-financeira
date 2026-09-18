import type { Category, PaymentMethod, Settings } from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-dizimo', name: 'Dízimo', type: 'despesa', color: '#10B981', icon: 'HeartHandshake', isDefault: true },
  { id: 'cat-aluguel', name: 'Aluguel', type: 'despesa', color: '#6366F1', icon: 'Home', isDefault: true },
  { id: 'cat-gas', name: 'Gás', type: 'despesa', color: '#F59E0B', icon: 'Flame', isDefault: true },
  { id: 'cat-faculdade', name: 'Faculdade', type: 'despesa', color: '#3B82F6', icon: 'GraduationCap', isDefault: true },
  { id: 'cat-cabelo', name: 'Corte de cabelo', type: 'despesa', color: '#EC4899', icon: 'Scissors', isDefault: true },
  { id: 'cat-familia', name: 'Ajuda familiar', type: 'despesa', color: '#8B5CF6', icon: 'Users', isDefault: true },
  { id: 'cat-pet', name: 'Pet', type: 'despesa', color: '#14B8A6', icon: 'Dog', isDefault: true },
  { id: 'cat-mercado', name: 'Mercado/Alimentação', type: 'despesa', color: '#EF4444', icon: 'ShoppingBag', isDefault: true },
  { id: 'cat-transporte', name: 'Transporte', type: 'despesa', color: '#06B6D4', icon: 'Car', isDefault: true },
  { id: 'cat-contas', name: 'Contas (Água/Luz)', type: 'despesa', color: '#F97316', icon: 'Zap', isDefault: true },
  { id: 'cat-internet', name: 'Celular/Internet', type: 'despesa', color: '#84CC16', icon: 'Wifi', isDefault: true },
  { id: 'cat-saude', name: 'Saúde/Farmácia', type: 'despesa', color: '#E11D48', icon: 'Cross', isDefault: true },
  { id: 'cat-dividas', name: 'Pagamento de dívidas', type: 'despesa', color: '#9333EA', icon: 'CreditCard', isDefault: true },
  { id: 'cat-reserva', name: 'Reserva de emergência', type: 'despesa', color: '#10B981', icon: 'ShieldCheck', isDefault: true },
  { id: 'cat-lazer', name: 'Lazer', type: 'despesa', color: '#F43F5E', icon: 'Smile', isDefault: true },
  { id: 'cat-vestuario', name: 'Vestuário', type: 'despesa', color: '#A855F7', icon: 'Shirt', isDefault: true },
  { id: 'cat-educacao', name: 'Educação/Cursos', type: 'despesa', color: '#2563EB', icon: 'BookOpen', isDefault: true },
  { id: 'cat-outros-exp', name: 'Outros (Despesa)', type: 'despesa', color: '#6B7280', icon: 'MoreHorizontal', isDefault: true },

  // Receitas
  { id: 'cat-salario-empresa', name: 'Salário (Empresa)', type: 'receita', color: '#059669', icon: 'Banknote', isDefault: true },
  { id: 'cat-beneficios', name: 'Benefícios (VA / VR / Auxílios)', type: 'receita', color: '#10B981', icon: 'Gift', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance / Extra', type: 'receita', color: '#3B82F6', icon: 'Briefcase', isDefault: true },
  { id: 'cat-investimentos', name: 'Investimentos', type: 'receita', color: '#8B5CF6', icon: 'TrendingUp', isDefault: true },
  { id: 'cat-presentes', name: 'Presentes / Prêmios', type: 'receita', color: '#F59E0B', icon: 'Gift', isDefault: true },
  { id: 'cat-outros-inc', name: 'Outras Receitas', type: 'receita', color: '#64748B', icon: 'PlusCircle', isDefault: true },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-pix', name: 'PIX' },
  { id: 'pm-dinheiro', name: 'Dinheiro' },
  { id: 'pm-cartao-credito', name: 'Cartão de Crédito' },
  { id: 'pm-cartao-debito', name: 'Cartão de Débito' },
  { id: 'pm-boleto', name: 'Boleto Bancário' },
  { id: 'pm-transferencia', name: 'Transferência Bancária (TED/DOC)' },
];

export const DEFAULT_SETTINGS: Settings = {
  tithePercentage: 10,
  debtClearanceTargetDate: '2026-12-31',
  currency: 'BRL',
  theme: 'dark',
};
