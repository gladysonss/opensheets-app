import type { ChangelogEntry } from "./data";

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
