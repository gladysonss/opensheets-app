"use client";

import { cn } from "@/lib/utils/ui";

import type { CalendarEvent } from "@/components/calendario/types";
import { EVENT_TYPE_STYLES } from "@/components/calendario/day-cell";

const LEGEND_ITEMS: Array<{
  type: CalendarEvent["type"];
  label: string;
}> = [
  { type: "lancamento", label: "Lançamento financeiro" },
  { type: "boleto", label: "Boleto com vencimento" },
  { type: "cartao", label: "Vencimento de cartão" },
];

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[11px] font-medium text-muted-foreground">
      {LEGEND_ITEMS.map((item) => {
        const style = EVENT_TYPE_STYLES[item.type];
        return (
          <span key={item.type} className="flex items-center gap-2">
            <span
              className={cn(
                "size-2.5 rounded-full border border-black/10 dark:border-white/20",
                style.dot
              )}
            />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
