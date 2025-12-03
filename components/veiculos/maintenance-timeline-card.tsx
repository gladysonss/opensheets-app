"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Manutencao, Lancamento } from "@/db/schema";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/ui";
import { Wrench, Gauge, Eye, Pencil, Trash2, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend Manutencao to include the relation
type ManutencaoWithLancamento = Manutencao & {
  lancamento: Lancamento | null;
};

interface MaintenanceTimelineCardProps {
  manutencoes: ManutencaoWithLancamento[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function MaintenanceTimelineCard({
  manutencoes,
  onEdit,
  onDelete,
  onView,
}: MaintenanceTimelineCardProps) {
  if (manutencoes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <Wrench className="mb-4 size-10 opacity-50" />
          <p>Nenhuma manutenção registrada.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by date descending
  const sortedItems = [...manutencoes].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="relative space-y-8 pl-4 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-1/2 before:border-l-2 before:border-dashed before:border-muted before:content-['']">
      {sortedItems.map((item) => (
        <div key={item.id} className="relative flex gap-6">
          {/* Timeline Icon */}
          <div className="absolute left-0 top-1 -ml-4 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background shadow-sm">
            <Wrench className="size-4 text-blue-500" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2 rounded-lg border bg-card/50 p-4 shadow-sm transition-all hover:bg-card">
            {/* Header: Service Name and Date */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground">{item.serviceName}</h4>

              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(item.date)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mt-2 grid gap-y-2 sm:grid-cols-2">
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
