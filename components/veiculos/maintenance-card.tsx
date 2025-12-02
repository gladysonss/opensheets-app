"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Wrench, Calendar, Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Manutencao } from "@/db/schema";

interface MaintenanceCardProps {
  maintenance: Manutencao & {
    veiculo?: {
      name: string;
    };
  };
  onEdit?: (maintenance: Manutencao) => void;
  onDelete?: (id: string) => void;
  showVehicle?: boolean;
}

const maintenanceTypeLabels = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  revisao: "Revisão",
  outros: "Outros",
};

const maintenanceTypeColors = {
  preventiva: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  corretiva: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  revisao: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  outros: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function MaintenanceCard({
  maintenance,
  onEdit,
  onDelete,
  showVehicle = false,
}: MaintenanceCardProps) {
  const totalCost = Number(maintenance.totalCost);
  const laborCost = maintenance.laborCost ? Number(maintenance.laborCost) : 0;
  const partsCost = maintenance.partsCost ? Number(maintenance.partsCost) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{maintenance.serviceName}</h3>
            </div>
            {showVehicle && maintenance.veiculo && (
              <p className="text-sm text-muted-foreground">
                {maintenance.veiculo.name}
              </p>
            )}
          </div>
          <Badge className={maintenanceTypeColors[maintenance.type]}>
            {maintenanceTypeLabels[maintenance.type]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date and Odometer */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(maintenance.date), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            <span>{maintenance.odometer.toLocaleString("pt-BR")} km</span>
          </div>
        </div>

        {/* Workshop */}
        {maintenance.workshop && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Oficina:</span> {maintenance.workshop}
          </p>
        )}

        {/* Description */}
        {maintenance.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {maintenance.description}
          </p>
        )}

        {/* Parts */}
        {maintenance.parts && (
          <div className="text-sm">
            <span className="font-medium">Peças:</span>
            <p className="text-muted-foreground line-clamp-2">{maintenance.parts}</p>
          </div>
        )}

        {/* Costs */}
        <div className="space-y-1 border-t pt-3">
          {laborCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mão de obra:</span>
              <span>{formatCurrency(laborCost)}</span>
            </div>
          )}
          {partsCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peças:</span>
              <span>{formatCurrency(partsCost)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-lg">{formatCurrency(totalCost)}</span>
          </div>
        </div>

        {/* Next Maintenance */}
        {(maintenance.nextMaintenanceKm || maintenance.nextMaintenanceDate) && (
          <div className="border-t pt-3 text-sm">
            <p className="font-medium mb-1">Próxima manutenção:</p>
            <div className="text-muted-foreground space-y-1">
              {maintenance.nextMaintenanceKm && (
                <p>• {maintenance.nextMaintenanceKm.toLocaleString("pt-BR")} km</p>
              )}
              {maintenance.nextMaintenanceDate && (
                <p>
                  • {format(new Date(maintenance.nextMaintenanceDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(maintenance)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(maintenance.id)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
