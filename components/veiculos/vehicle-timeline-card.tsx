"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Abastecimento, Manutencao, Lancamento } from "@/db/schema";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/ui";
import { Fuel, Wrench, FileText, Gauge, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

// Types for the unified timeline
type AbastecimentoWithLancamento = Abastecimento & {
  lancamento: Lancamento | null;
  type: "refueling";
};

type ManutencaoWithLancamento = Manutencao & {
  lancamento: Lancamento | null;
  type: "maintenance";
};

type GenericExpense = Lancamento & {
  type: "expense";
};

export type TimelineItem = AbastecimentoWithLancamento | ManutencaoWithLancamento | GenericExpense;

interface VehicleTimelineCardProps {
  items: TimelineItem[];
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (item: TimelineItem) => void;
  onView?: (item: TimelineItem) => void;
}

export function VehicleTimelineCard({
  items,
  onEdit,
  onDelete,
  onView,
}: VehicleTimelineCardProps) {
  
  // Sort items by date descending
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = a.type === "expense" ? a.purchaseDate : a.date;
      const dateB = b.type === "expense" ? b.purchaseDate : b.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [items]);

  // Calculate efficiency for refueling items (simplified logic for display)
  // Note: For a perfect efficiency calculation we need the full history, 
  // but here we just process what's passed to us.
  // If we need perfect efficiency, we should calculate it in the parent or pass pre-calculated data.
  // For now, let's just display what we have.

  if (sortedItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <FileText className="mb-4 size-10 opacity-50" />
          <p>Nenhum registro encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative space-y-8 pl-4 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-1/2 before:border-l-2 before:border-dashed before:border-muted before:content-['']">
      {sortedItems.map((item) => {
        const date = item.type === "expense" ? item.purchaseDate : item.date;
        const cost = item.type === "expense" ? Math.abs(Number(item.amount)) : Number(item.totalCost);

        return (
          <div key={`${item.type}-${item.id}`} className="relative flex gap-6">
            {/* Timeline Icon */}
            <div className="absolute left-0 top-1 -ml-4 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background shadow-sm">
              {item.type === "refueling" && <Fuel className="size-4 text-orange-500" />}
              {item.type === "maintenance" && <Wrench className="size-4 text-blue-500" />}
              {item.type === "expense" && <FileText className="size-4 text-green-500" />}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 rounded-lg border bg-card/50 p-4 shadow-sm transition-all hover:bg-card">
              {/* Header: Title and Date */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {item.type === "refueling" && "Abastecimento"}
                    {item.type === "maintenance" && item.serviceName}
                    {item.type === "expense" && item.name}
                  </h4>
                  {item.type === "expense" && item.category && (
                    <span className="text-xs text-muted-foreground">{item.category.name}</span>
                  )}
                  {item.type === "refueling" && (
                     <span className="text-xs text-muted-foreground">
                        {item.fuelType === "gasolina" ? "Gas. Comum" : 
                         item.fuelType === "etanol" ? "Etanol" : 
                         item.fuelType === "diesel" ? "Diesel" : item.fuelType}
                     </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(date)}
                </span>
              </div>

                {/* Details Grid */}
              <div className="mt-2 grid gap-y-2 sm:grid-cols-2">
                
                {/* Left Column: Specific Info */}
                <div className="flex flex-col gap-1 text-sm">
                    {item.type === "refueling" && (() => {
                      // Find previous refueling for efficiency calculation
                      // We need to look at the full list of refuelings, not just the mixed timeline
                      const refuelings = items
                        .filter((i): i is AbastecimentoWithLancamento => i.type === "refueling")
                        .sort((a, b) => b.odometer - a.odometer);
                      
                      const currentIndex = refuelings.findIndex(r => r.id === item.id);
                      const previousRefueling = currentIndex !== -1 && currentIndex < refuelings.length - 1 
                        ? refuelings[currentIndex + 1] 
                        : null;

                      const distance = previousRefueling ? item.odometer - previousRefueling.odometer : 0;
                      const efficiency = distance > 0 ? distance / Number(item.liters) : 0;

                      return (
                        <>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                  <Gauge className="size-4 text-muted-foreground" />
                                  <span>{item.odometer} km</span>
                              </div>
                              {efficiency > 0 && (
                                <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                                  <span>{efficiency.toFixed(2)} km/L</span>
                                </div>
                              )}
                            </div>
                            <div className="text-muted-foreground">
                                {Number(item.liters).toFixed(3)} L x {formatCurrency(Number(item.pricePerLiter))}
                            </div>
                        </>
                      );
                    })()}

                    {item.type === "maintenance" && (
                        <div className="flex items-center gap-2">
                            <Gauge className="size-4 text-muted-foreground" />
                            <span>{item.odometer} km</span>
                        </div>
                    )}

                    {item.type === "expense" && (
                        <div className="text-muted-foreground">
                            {item.paymentMethod}
                        </div>
                    )}
                </div>

                {/* Right Column: Cost */}
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground sm:justify-end">
                  {formatCurrency(cost)}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-2 flex items-center justify-end gap-2 border-t pt-2">
                {onView && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onView(item)}>
                    <Eye className="size-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
