"use client";

import { MaintenanceCard } from "./maintenance-card";
import type { Manutencao } from "@/db/schema";

interface MaintenanceListProps {
  maintenances: (Manutencao & {
    veiculo?: {
      name: string;
    };
  })[];
  onEdit?: (maintenance: Manutencao) => void;
  onDelete?: (id: string) => void;
  showVehicle?: boolean;
  emptyMessage?: string;
}

export function MaintenanceList({
  maintenances,
  onEdit,
  onDelete,
  showVehicle = false,
  emptyMessage = "Nenhuma manutenção registrada.",
}: MaintenanceListProps) {
  if (maintenances.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {maintenances.map((maintenance) => (
        <MaintenanceCard
          key={maintenance.id}
          maintenance={maintenance}
          onEdit={onEdit}
          onDelete={onDelete}
          showVehicle={showVehicle}
        />
      ))}
    </div>
  );
}
