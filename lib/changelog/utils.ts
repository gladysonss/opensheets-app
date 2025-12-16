import type { ChangelogEntry } from "./data";

/**
 * Converte uma string de data para um formato compatível com Safari.
 * Safari não aceita "YYYY-MM-DD HH:mm:ss ±HHMM", requer "YYYY-MM-DDTHH:mm:ss±HHMM"
 *
 * @param dateString - String de data no formato "YYYY-MM-DD HH:mm:ss ±HHMM"
 * @returns Date object válido
 */
export function parseSafariCompatibleDate(dateString: string): Date {
  // Substitui o espaço entre data e hora por "T" (formato ISO 8601)
  // Exemplo: "2025-12-09 17:26:08 +0000" → "2025-12-09T17:26:08+0000"
  const isoString = dateString.replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+/, "$1T$2");
  return new Date(isoString);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    feature: "Novidades",
    bugfix: "Correções",
    performance: "Performance",
    documentation: "Documentação",
    style: "Interface",
    refactor: "Melhorias",
    test: "Testes",
    chore: "Manutenção",
    other: "Outros",
  };
  return labels[category] || "Outros";
}

export function groupEntriesByCategory(entries: ChangelogEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    },
    {} as Record<string, ChangelogEntry[]>
  );
}
