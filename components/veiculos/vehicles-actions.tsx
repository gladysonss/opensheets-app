"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fuel, Wrench } from "lucide-react";
import { RefuelingFormDialog } from "@/components/veiculos/refueling-form-dialog";
import { MaintenanceFormDialog } from "@/components/veiculos/maintenance-form-dialog";
import type { Option } from "@/types/common";

interface VehiclesActionsProps {
  vehicleOptions: Option[];
  contaOptions: Option[];
  cartaoOptions: Option[];
  pagadorOptions: Option[];
}

export function VehiclesActions({
  vehicleOptions,
  contaOptions,
  cartaoOptions,
  pagadorOptions,
}: VehiclesActionsProps) {
  const [refuelingDialogOpen, setRefuelingDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => setRefuelingDialogOpen(true)}>
        <Fuel className="mr-2 h-4 w-4" />
        Novo Abastecimento
      </Button>
      
      <Button variant="outline" onClick={() => setMaintenanceDialogOpen(true)}>
        <Wrench className="mr-2 h-4 w-4" />
        Nova Manutenção
      </Button>

      <RefuelingFormDialog
        open={refuelingDialogOpen}
        onOpenChange={setRefuelingDialogOpen}
        vehicleOptions={vehicleOptions}
        contaOptions={contaOptions}
        cartaoOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
      />

      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        vehicleOptions={vehicleOptions}
        accountOptions={contaOptions}
        cardOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
      />
    </div>
  );
}
