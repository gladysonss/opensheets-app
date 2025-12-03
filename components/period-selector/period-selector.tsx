"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeriodSelector } from "@/hooks/use-period-selector";
import { displayPeriodExtended, PeriodType } from "@/lib/utils/period";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PeriodSelector() {
  const { currentPeriod, currentType, navigateNext, navigatePrev, changeType } =
    usePeriodSelector();

  return (
    <Card className="flex items-center justify-between p-2 gap-2 w-full md:w-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={navigatePrev}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center min-w-[140px]">
          <span className="text-sm font-medium capitalize">
            {displayPeriodExtended(currentPeriod)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={navigateNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-l pl-2">
        <Select
          value={currentType}
          onValueChange={(val) => changeType(val as PeriodType)}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mensal</SelectItem>
            <SelectItem value="quarter">Trimestral</SelectItem>
            <SelectItem value="semester">Semestral</SelectItem>
            <SelectItem value="year">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
