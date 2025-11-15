"use client";

import { cn } from "@/lib/utils/ui";

import type { CalendarDay } from "@/components/calendario/types";
import { WEEK_DAYS_SHORT } from "@/components/calendario/utils";
import { DayCell } from "@/components/calendario/day-cell";

type CalendarGridProps = {
  days: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
  onCreateDay: (day: CalendarDay) => void;
};

export function CalendarGrid({
  days,
  onSelectDay,
  onCreateDay,
}: CalendarGridProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-card drop-shadow-xs px-2">
      <div className="grid grid-cols-7 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {WEEK_DAYS_SHORT.map((dayName) => (
          <span key={dayName} className="px-3 py-2 text-center">
            {dayName}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border/60 px-px pb-px pt-px">
        {days.map((day) => (
          <div
            key={day.date}
            className={cn("h-[150px] bg-card p-0.5", !day.isCurrentMonth && "")}
          >
            <DayCell day={day} onSelect={onSelectDay} onCreate={onCreateDay} />
          </div>
        ))}
      </div>
    </div>
  );
}
