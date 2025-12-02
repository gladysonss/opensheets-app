"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/ui";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import * as React from "react";

type MonthYearPickerProps = {
  currentMonth: string;
  currentYear: string;
  monthNames: string[];
  onSelect: (month: string, year: string) => void;
  children: React.ReactNode;
};

export function MonthYearPicker({
  currentMonth,
  currentYear,
  monthNames,
  onSelect,
  children,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(parseInt(currentYear));

  // Reset view year when opening
  React.useEffect(() => {
    if (open) {
      setViewYear(parseInt(currentYear));
    }
  }, [open, currentYear]);

  const handleYearChange = (delta: number) => {
    setViewYear((prev) => prev + delta);
  };

  const handleMonthSelect = (month: string) => {
    onSelect(month, viewYear.toString());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="center">
        <div className="flex flex-col gap-2 p-3">
          {/* Year Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleYearChange(-1)}
            >
              <RiArrowLeftSLine className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">{viewYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleYearChange(1)}
            >
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month) => {
              const isSelected =
                month === currentMonth && viewYear === parseInt(currentYear);
              
              // Capitalize first letter
              const label = month.charAt(0).toUpperCase() + month.slice(1, 3);

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 w-full text-xs",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => handleMonthSelect(month)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
