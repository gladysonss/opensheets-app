"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Fuel, Wrench, FileText } from "lucide-react";
import { RefuelingFormDialog } from "@/components/veiculos/refueling-form-dialog";
import { MaintenanceFormDialog } from "@/components/veiculos/maintenance-form-dialog";
import { VehicleExpenseFormDialog } from "@/components/veiculos/vehicle-expense-form-dialog";
import type { Option } from "@/types/common";

interface VehiclesActionsProps {
  vehicleOptions: Option[];
  contaOptions: Option[];
  cartaoOptions: Option[];
  pagadorOptions: Option[];
  categoryOptions?: Option[];
}

export function VehiclesActions({
  vehicleOptions,
  contaOptions,
  cartaoOptions,
  pagadorOptions,
  categoryOptions = [],
}: VehiclesActionsProps) {
  const [refuelingDialogOpen, setRefuelingDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Find "Veículo" category for default selection
  const vehicleCategory = categoryOptions.find(c => c.label === "Veículo" || c.label === "Veiculo");
  const defaultCategoryId = vehicleCategory?.value;

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 size-4" />
            Novo Registro
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRefuelingDialogOpen(true)}>
            <Fuel className="mr-2 size-4" />
            Abastecimento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMaintenanceDialogOpen(true)}>
            <Wrench className="mr-2 size-4" />
            Manutenção
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExpenseDialogOpen(true)}>
            <FileText className="mr-2 size-4" />
            Outros
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RefuelingFormDialog
        open={refuelingDialogOpen}
        onOpenChange={setRefuelingDialogOpen}
        vehicleOptions={vehicleOptions}
        contaOptions={contaOptions}
        cartaoOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        defaultCategoryId={defaultCategoryId}
      />

      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        vehicleOptions={vehicleOptions}
        accountOptions={contaOptions}
        cardOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        defaultCategoryId={defaultCategoryId}
      />

      <VehicleExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}

        vehicleOptions={vehicleOptions}
        accountOptions={contaOptions}
        cardOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        categoryOptions={categoryOptions}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  );
}
