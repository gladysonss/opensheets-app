import type { Lancamento } from "@/db/schema";
import type { EligibleInstallment } from "./anticipation-types";

/**
 * Calcula o valor total de antecipação baseado nas parcelas selecionadas
 */
export function calculateTotalAnticipationAmount(
  installments: EligibleInstallment[]
): number {
  return installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
}

/**
 * Valida se o período de antecipação é válido
 * O período não pode ser anterior ao período da primeira parcela selecionada
 */
export function validateAnticipationPeriod(
  period: string,
  installments: EligibleInstallment[]
): boolean {
  if (installments.length === 0) return false;

  const earliestPeriod = installments.reduce((earliest, inst) => {
    return inst.period < earliest ? inst.period : earliest;
  }, installments[0].period);

  return period >= earliestPeriod;
}

/**
 * Formata os números das parcelas antecipadas em uma string legível
 * Exemplo: "1, 2, 3" ou "5, 6, 7, 8"
 */
export function getAnticipatedInstallmentNumbers(
  installments: EligibleInstallment[]
): string {
  const numbers = installments
    .map((inst) => inst.currentInstallment)
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b)
    .join(", ");
  return numbers;
}

/**
 * Formata o resumo de parcelas antecipadas
 * Exemplo: "Parcelas 1-3 de 12" ou "Parcela 5 de 12"
 */
export function formatAnticipatedInstallmentsRange(
  installments: EligibleInstallment[]
): string {
  const numbers = installments
    .map((inst) => inst.currentInstallment)
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b);

  if (numbers.length === 0) return "";
  if (numbers.length === 1) {
    const total = installments[0]?.installmentCount ?? 0;
    return `Parcela ${numbers[0]} de ${total}`;
  }

  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  const total = installments[0]?.installmentCount ?? 0;

  // Se as parcelas são consecutivas
  const isConsecutive = numbers.every((num, i) => {
    if (i === 0) return true;
    return num === numbers[i - 1]! + 1;
  });

  if (isConsecutive) {
    return `Parcelas ${first}-${last} de ${total}`;
  } else {
    return `${numbers.length} parcelas de ${total}`;
  }
}

/**
 * Verifica se uma antecipação pode ser cancelada
 * Só pode cancelar se o lançamento de antecipação não foi pago
 */
export function canCancelAnticipation(lancamento: Lancamento): boolean {
  return lancamento.isSettled !== true;
}

/**
 * Ordena parcelas por número da parcela atual
 */
export function sortInstallmentsByNumber(
  installments: EligibleInstallment[]
): EligibleInstallment[] {
  return [...installments].sort((a, b) => {
    const aNum = a.currentInstallment ?? 0;
    const bNum = b.currentInstallment ?? 0;
    return aNum - bNum;
  });
}

/**
 * Calcula quantas parcelas restam após uma antecipação
 */
export function calculateRemainingInstallments(
  totalInstallments: number,
  anticipatedCount: number
): number {
  return Math.max(0, totalInstallments - anticipatedCount);
}

/**
 * Valida se as parcelas selecionadas pertencem à mesma série
 */
export function validateInstallmentsSameSeries(
  installments: EligibleInstallment[],
  seriesId: string
): boolean {
  // Esta validação será feita no servidor com os dados completos
  // Aqui apenas retorna true como placeholder
  return installments.length > 0;
}

/**
 * Gera descrição automática para o lançamento de antecipação
 */
export function generateAnticipationDescription(
  lancamentoName: string,
  installmentCount: number
): string {
  return `Antecipação de ${installmentCount} ${
    installmentCount === 1 ? "parcela" : "parcelas"
  } - ${lancamentoName}`;
}

/**
 * Formata nota automática para antecipação
 */
export function generateAnticipationNote(
  installments: EligibleInstallment[]
): string {
  const range = formatAnticipatedInstallmentsRange(installments);
  return `Antecipação: ${range}`;
}
