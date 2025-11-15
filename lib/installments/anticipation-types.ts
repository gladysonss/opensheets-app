import type {
  Categoria,
  InstallmentAnticipation,
  Lancamento,
  Pagador,
} from "@/db/schema";

/**
 * Parcela elegível para antecipação
 */
export type EligibleInstallment = {
  id: string;
  name: string;
  amount: string;
  period: string;
  purchaseDate: Date;
  dueDate: Date | null;
  currentInstallment: number | null;
  installmentCount: number | null;
  paymentMethod: string;
  categoriaId: string | null;
  pagadorId: string | null;
};

/**
 * Antecipação com dados completos
 */
export type InstallmentAnticipationWithRelations = InstallmentAnticipation & {
  lancamento: Lancamento;
  pagador: Pagador | null;
  categoria: Categoria | null;
};

/**
 * Input para criar antecipação
 */
export type CreateAnticipationInput = {
  seriesId: string;
  installmentIds: string[];
  anticipationPeriod: string;
  pagadorId?: string;
  categoriaId?: string;
  note?: string;
};

/**
 * Input para cancelar antecipação
 */
export type CancelAnticipationInput = {
  anticipationId: string;
};

/**
 * Resumo de antecipação para exibição
 */
export type AnticipationSummary = {
  id: string;
  totalAmount: string;
  installmentCount: number;
  anticipationPeriod: string;
  anticipationDate: Date;
  note: string | null;
  isSettled: boolean;
  lancamentoId: string;
  anticipatedInstallments: string[];
};
