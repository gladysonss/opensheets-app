"use client";

import { EVENT_TYPE_STYLES } from "@/components/calendario/day-cell";
import type { CalendarEvent } from "@/components/calendario/types";
import { cn } from "@/lib/utils/ui";

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
    <div className="flex flex-wrap gap-3 rounded-sm border border-border/60 bg-muted/20 p-2 text-xs font-medium text-muted-foreground">
      {LEGEND_ITEMS.map((item) => {
        const style = EVENT_TYPE_STYLES[item.type];
        return (
          <span key={item.type} className="flex items-center gap-2">
            <span className={cn("size-3 rounded-full", style.dot)} />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
