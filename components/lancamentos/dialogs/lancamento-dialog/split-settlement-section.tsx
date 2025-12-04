"use client";

import { cn } from "@/lib/utils/ui";
import { Checkbox } from "@/components/ui/checkbox";
import type { SplitAndSettlementSectionProps } from "./lancamento-dialog-types";

export function SplitAndSettlementSection({
  formState,
  onFieldChange,
  showSettledToggle,
}: SplitAndSettlementSectionProps) {
  const amount = Number(formState.amount) || 0;
  const percentage = formState.splitPercentage ?? 50;
  const secondaryAmount = (amount * percentage) / 100;
  const primaryAmount = amount - secondaryAmount;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="flex w-full flex-col gap-2 py-2">
      <div className="flex w-full flex-col gap-2 md:flex-row">
        <div
          className={cn(
            "space-y-1",
            showSettledToggle ? "md:w-1/2 md:pr-2" : "md:w-full"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Dividir lançamento</p>
              <p className="text-xs text-muted-foreground">
                Selecione para atribuir parte do valor a outro pagador.
              </p>
            </div>
            <Checkbox
              checked={formState.isSplit}
              onCheckedChange={(checked) =>
                onFieldChange("isSplit", Boolean(checked))
              }
              aria-label="Dividir lançamento"
            />
          </div>
        </div>

        {showSettledToggle ? (
          <div className="space-y-1 md:w-1/2 md:pr-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Marcar como pago</p>
                <p className="text-xs text-muted-foreground">
                  Indica que o lançamento já foi pago ou recebido.
                </p>
              </div>
              <Checkbox
                checked={Boolean(formState.isSettled)}
                onCheckedChange={(checked) =>
                  onFieldChange("isSettled", Boolean(checked))
                }
                aria-label="Marcar como concluído"
              />
            </div>
          </div>
        ) : null}
      </div>

      {formState.isSplit && (
        <div className="mt-2 space-y-4 rounded-md border p-4">
          <div className="space-y-2">
            <label
              htmlFor="splitPercentage"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Porcentagem do segundo pagador (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="splitPercentage"
                type="range"
                min="0"
                max="100"
                step="1"
                value={percentage}
                onChange={(e) =>
                  onFieldChange("splitPercentage", Number(e.target.value))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
              />
              <div className="flex w-20 items-center rounded-md border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => {
                    const val = Math.min(
                      100,
                      Math.max(0, Number(e.target.value))
                    );
                    onFieldChange("splitPercentage", val);
                  }}
                  className="w-full bg-transparent text-right text-sm outline-none"
                />
                <span className="ml-1 text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Pagador Principal</p>
              <p className="font-medium">{formatCurrency(primaryAmount)}</p>
              <p className="text-xs text-muted-foreground">
                {100 - percentage}%
              </p>
            </div>
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Pagador Secundário</p>
              <p className="font-medium">{formatCurrency(secondaryAmount)}</p>
              <p className="text-xs text-muted-foreground">{percentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
