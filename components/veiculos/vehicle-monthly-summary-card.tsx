"use client";

import MoneyValues from "@/components/money-values";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/ui";
import type { CSSProperties } from "react";

export type VehicleMonthlyBreakdown = {
  total: number;
  splits: {
    abastecimento: number;
    manutencao: number;
    despesa: number;
  };
};

const segmentConfig = {
  abastecimento: {
    label: "Abastecimentos",
    color: "bg-blue-500",
  },
  manutencao: {
    label: "Manutenções",
    color: "bg-orange-500",
  },
  despesa: {
    label: "Outras Despesas",
    color: "bg-red-500",
  },
} as const;

type VehicleMonthlySummaryCardProps = {
  periodLabel: string;
  breakdown: VehicleMonthlyBreakdown;
};

export function VehicleMonthlySummaryCard({
  periodLabel,
  breakdown,
}: VehicleMonthlySummaryCardProps) {
  const splittableEntries = (
    Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>
  ).map((key) => ({
    key,
    ...segmentConfig[key],
    value: breakdown.splits[key],
  }));

  const totalBase = breakdown.total;
  let offset = 0;

  return (
    <Card className="border">
      <CardHeader className="flex flex-col gap-1.5 pb-4">
        <CardTitle className="text-lg font-semibold">Totais do mês</CardTitle>
        <p className="text-xs text-muted-foreground">
          {periodLabel} - despesas por categoria
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total gasto no mês
            </span>
            <MoneyValues
              amount={breakdown.total}
              className="block text-2xl font-semibold text-foreground"
            />
          </div>

          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            {splittableEntries.map((entry) => {
              const percent =
                totalBase > 0
                  ? Math.max((entry.value / totalBase) * 100, 0)
                  : 0;
              const style: CSSProperties = {
                width: `${percent}%`,
                left: `${offset}%`,
              };
              offset += percent;
              return (
                <span
                  key={entry.key}
                  className={cn(
                    "absolute inset-y-0 rounded-full transition-all",
                    entry.color
                  )}
                  style={style}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {splittableEntries.map((entry) => {
            const percent =
              totalBase > 0 ? Math.round((entry.value / totalBase) * 100) : 0;
            return (
              <div key={entry.key} className="space-y-1 rounded-lg border p-3">
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                  <span
                    className={cn("size-2 rounded-full", entry.color)}
                    aria-hidden
                  />
                  {entry.label}
                </span>
                <MoneyValues
                  amount={entry.value}
                  className="block text-lg font-semibold text-foreground"
                />
                <span className="text-xs text-muted-foreground">
                  {percent}% das despesas
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
