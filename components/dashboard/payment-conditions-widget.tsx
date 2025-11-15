import MoneyValues from "@/components/money-values";
import type { PaymentConditionsData } from "@/lib/dashboard/payments/payment-conditions";
import {
  RiCheckLine,
  RiLoader2Fill,
  RiRefreshLine,
  RiSlideshowLine,
} from "@remixicon/react";
import type { ReactNode } from "react";
import { Progress } from "../ui/progress";
import { WidgetEmptyState } from "../widget-empty-state";

type PaymentConditionsWidgetProps = {
  data: PaymentConditionsData;
};

const CONDITION_ICON_CLASSES =
  "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground";

const CONDITION_ICONS: Record<string, ReactNode> = {
  "À vista": <RiCheckLine className="size-5" aria-hidden />,
  Parcelado: <RiLoader2Fill className="size-5" aria-hidden />,
  Recorrente: <RiRefreshLine className="size-5" aria-hidden />,
};

const formatPercentage = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

export function PaymentConditionsWidget({
  data,
}: PaymentConditionsWidgetProps) {
  if (data.conditions.length === 0) {
    return (
      <WidgetEmptyState
        icon={<RiSlideshowLine className="size-6 text-muted-foreground" />}
        title="Nenhuma despesa encontrada"
        description="As distribuições por condição aparecerão conforme novos lançamentos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 px-0">
      <ul className="flex flex-col gap-2">
        {data.conditions.map((condition) => {
          const Icon =
            CONDITION_ICONS[condition.condition] ?? CONDITION_ICONS["À vista"];
          const percentageLabel = formatPercentage(condition.percentage);

          return (
            <li
              key={condition.condition}
              className="flex items-center gap-3 border-b border-dashed pb-4 last:border-b-0 last:pb-0"
            >
              <div className={CONDITION_ICON_CLASSES}>{Icon}</div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground text-sm">
                    {condition.condition}
                  </p>
                  <MoneyValues amount={condition.amount} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {condition.transactions}{" "}
                    {condition.transactions === 1
                      ? "lançamento"
                      : "lançamentos"}
                  </span>
                  <span>{percentageLabel}%</span>
                </div>

                <div className="mt-1">
                  <Progress value={condition.percentage} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
