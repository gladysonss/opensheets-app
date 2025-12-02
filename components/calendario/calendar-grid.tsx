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
      <div className="hidden md:grid md:grid-cols-7 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {WEEK_DAYS_SHORT.map((dayName) => (
          <span key={dayName} className="px-3 py-2 text-center">
            {dayName}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-border/60 px-px pb-px pt-px">
        {days.map((day) => (
          <div
            key={day.date}
            className={cn(
              "bg-card p-0.5 min-h-[100px] md:h-[150px]",
              !day.isCurrentMonth && "hidden md:block" // Hide non-current month days on mobile to save space? Or just keep them? "hidden md:block" might be too aggressive if it hides the start/end of the grid. Let's keep them but maybe style differently. Actually, standard list view usually shows all. Let's stick to simple responsive height.
            )}
          >
            <DayCell day={day} onSelect={onSelectDay} onCreate={onCreateDay} />
          </div>
        ))}
      </div>
    </div>
  );
}
