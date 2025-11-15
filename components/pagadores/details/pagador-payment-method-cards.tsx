import MoneyValues from "@/components/money-values";
import { WidgetEmptyState } from "@/components/widget-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PagadorBoletoStats } from "@/lib/pagadores/details";
import { cn } from "@/lib/utils/ui";
import { RiBarcodeLine } from "@remixicon/react";

type PagadorBoletoCardProps = {
  stats: PagadorBoletoStats;
};

export function PagadorBoletoCard({ stats }: PagadorBoletoCardProps) {
  const total = stats.totalAmount;
  const paidPercent =
    total > 0 ? Math.round((stats.paidAmount / total) * 100) : 0;
  const pendingPercent =
    total > 0 ? Math.round((stats.pendingAmount / total) * 100) : 0;

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Boletos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Totais por status considerando o período atual.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {total === 0 ? (
          <WidgetEmptyState
            icon={<RiBarcodeLine className="size-6 text-muted-foreground" />}
            title="Nenhum lançamento com boleto"
            description="Quando houver despesas registradas com boleto, elas aparecerão aqui."
          />
        ) : (
          <>
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Total de boletos
              </span>
              <MoneyValues
                amount={total}
                className="block text-2xl font-semibold text-foreground"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-dashed p-3">
              <StatusRow
                label="Pagos"
                amount={stats.paidAmount}
                count={stats.paidCount}
                percent={paidPercent}
                tone="success"
              />
              <StatusRow
                label="Pendentes"
                amount={stats.pendingAmount}
                count={stats.pendingCount}
                percent={pendingPercent}
                tone="warning"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type StatusRowProps = {
  label: string;
  amount: number;
  count: number;
  percent: number;
  tone: "success" | "warning";
};

function StatusRow({ label, amount, count, percent, tone }: StatusRowProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  return (
    <div className="space-y-1 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} registros</span>
      </div>
      <MoneyValues
        amount={amount}
        className={cn(
          "text-xl font-semibold",
          tone === "success" ? "text-emerald-600" : "text-amber-600"
        )}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{clampedPercent}% do total</span>
        <div className="h-1.5 w-1/2 rounded-full bg-border/80">
          <div
            className={cn(
              "h-full rounded-full",
              tone === "success" ? "bg-emerald-500" : "bg-amber-500"
            )}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
