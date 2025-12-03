"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Abastecimento, Lancamento } from "@/db/schema";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/ui";
import { Fuel, Gauge, MapPin, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

// Extend Abastecimento to include the relation
type AbastecimentoWithLancamento = Abastecimento & {
  lancamento: Lancamento | null;
};

interface RefuelingTimelineCardProps {
  abastecimentos: AbastecimentoWithLancamento[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function RefuelingTimelineCard({
  abastecimentos,
  onEdit,
  onDelete,
  onView,
}: RefuelingTimelineCardProps) {
  // Calculate efficiencies
  const items = useMemo(() => {
    // Sort by odometer descending just to be safe, though usually date desc is enough
    const sorted = [...abastecimentos].sort((a, b) => b.odometer - a.odometer);

    return sorted.map((current, index) => {
      // Previous fill-up (which is next in the sorted descending array)
      const previous = sorted[index + 1];
      let efficiency: number | null = null;

      if (previous) {
        const distance = current.odometer - previous.odometer;
        const liters = Number(current.liters);
        if (distance > 0 && liters > 0) {
          const eff = distance / liters;
          // Filter out outliers (e.g. missing data causing huge distance)
          if (eff < 150) {
            efficiency = eff;
          }
        }
      }

      return {
        ...current,
        efficiency,
        hasPrevious: !!previous,
      };
    });
  }, [abastecimentos]);

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <Fuel className="mb-4 size-10 opacity-50" />
          <p>Nenhum abastecimento registrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative space-y-8 pl-4 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-1/2 before:border-l-2 before:border-dashed before:border-muted before:content-['']">
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-6">
          {/* Timeline Icon */}
          <div className="absolute left-0 top-1 -ml-4 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background shadow-sm">
            <Fuel className="size-4 text-orange-500" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2 rounded-lg border bg-card/50 p-4 shadow-sm transition-all hover:bg-card">
            {/* Header: Type and Date */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Abastecimento</h4>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(item.date)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mt-2 grid gap-y-2 sm:grid-cols-2">
              {/* Fuel Info */}
              <div className="flex items-center gap-2 text-sm">
                <Fuel className="size-4 text-muted-foreground" />
                <span>
                  {item.fuelType === "gasolina" ? "Gas. Comum" : 
                   item.fuelType === "etanol" ? "Etanol" : 
                   item.fuelType === "diesel" ? "Diesel" : item.fuelType} 
                  {" "}({Number(item.liters).toFixed(3)} L)
                </span>
              </div>

              {/* Efficiency */}
              <div className="flex items-center gap-2 text-sm">
                <span className="flex size-4 items-center justify-center font-bold text-muted-foreground">
                  ≈
                </span>
                <span className={cn(
                  "font-medium",
                  !item.efficiency && "text-muted-foreground italic"
                )}>
                  {item.efficiency 
                    ? `${item.efficiency.toFixed(3)} km/L` 
                    : item.hasPrevious ? "---" : "Primeiro registro"}
                </span>
              </div>

              {/* Odometer */}
              <div className="flex items-center gap-2 text-sm">
                <Gauge className="size-4 text-muted-foreground" />
                <span>{item.odometer} km</span>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground sm:justify-end">
                {formatCurrency(Number(item.totalCost))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-2 flex items-center justify-end gap-2 border-t pt-2">
              {onView && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onView(item.id)}>
                  <Eye className="size-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(item.id)}>
                  <Pencil className="size-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item.id)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
