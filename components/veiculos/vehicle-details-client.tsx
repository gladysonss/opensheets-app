"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleTimelineCard, type TimelineItem } from "@/components/veiculos/vehicle-timeline-card";
import { VehicleExpenseDetailsDialog } from "@/components/veiculos/vehicle-expense-details-dialog";

import { RefuelingDetailsDialog } from "@/components/veiculos/refueling-details-dialog";
import { RefuelingFormDialog } from "@/components/veiculos/refueling-form-dialog";
import { MaintenanceFormDialog } from "@/components/veiculos/maintenance-form-dialog";
import { MaintenanceDetailsDialog } from "@/components/veiculos/maintenance-details-dialog";
import { VehicleExpenseFormDialog } from "@/components/veiculos/vehicle-expense-form-dialog";

import { deleteRefuelingAction, deleteMaintenanceAction } from "@/app/(dashboard)/veiculos/actions";
import { deleteLancamentoAction as deleteLancamentoActionOriginal } from "@/app/(dashboard)/lancamentos/actions";
import type { Option } from "@/types/common";

import { Plus, Fuel, Wrench, FileText, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatDateForDb } from "@/lib/utils/date";
import MonthPicker from "@/components/month-picker/month-picker";
import { displayPeriod } from "@/lib/utils/period";
import { VehicleReportStats } from "@/components/veiculos/vehicle-report-stats";
import { VehicleMonthlySummaryCard } from "@/components/veiculos/vehicle-monthly-summary-card";
import { VehicleHistoryCard } from "@/components/veiculos/vehicle-history-card";
import { VehicleEfficiencyChart } from "@/components/veiculos/vehicle-efficiency-chart";

interface VehicleDetailsClientProps {
  vehicle: {
    id: string;
    name: string;
    brand: string;
    model: string;
    plate: string | null;
    abastecimentos: any[];
    manutencoes: any[];
    lancamentos: any[];
  };
  monthlyBreakdown: {
    total: number;
    splits: {
      abastecimento: number;
      manutencao: number;
      despesa: number;
    };
  };
  historyData: any[];
  efficiencyData: any[];
  sixMonthRefueling: any[];
  periodString: string;
  vehicleOptions: Option[];
  contaOptions: Option[];
  cartaoOptions: Option[];
  pagadorOptions: Option[];
  categoryOptions: Option[];
}

export function VehicleDetailsClient({
  vehicle,
  monthlyBreakdown,
  historyData,
  efficiencyData,
  sixMonthRefueling,
  periodString,
  vehicleOptions,
  contaOptions,
  cartaoOptions,
  pagadorOptions,
  categoryOptions,
}: VehicleDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [refuelingDialogOpen, setRefuelingDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewRefuelingDialogOpen, setViewRefuelingDialogOpen] = useState(false);
  const [viewMaintenanceDialogOpen, setViewMaintenanceDialogOpen] = useState(false);
  const [viewExpenseDialogOpen, setViewExpenseDialogOpen] = useState(false);

  // Selection States
  const [selectedRefuelingId, setSelectedRefuelingId] = useState<string | null>(null);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [viewRefuelingId, setViewRefuelingId] = useState<string | null>(null);

  const [viewMaintenanceId, setViewMaintenanceId] = useState<string | null>(null);
  const [viewExpenseId, setViewExpenseId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: "refueling" | "maintenance" | "expense"; id: string } | null>(null);
  const [filterType, setFilterType] = useState<"all" | "refueling" | "maintenance" | "expense">("all");

  // Derived Data
  const selectedRefueling = vehicle.abastecimentos.find((a) => a.id === selectedRefuelingId);
  const selectedMaintenance = vehicle.manutencoes.find((m) => m.id === selectedMaintenanceId);
  
  // Filter generic expenses (not linked to refueling or maintenance)
  const maintenanceLancamentoIds = new Set(vehicle.manutencoes.map(m => m.lancamentoId).filter(Boolean));
  const refuelingLancamentoIds = new Set(vehicle.abastecimentos.map(a => a.lancamentoId).filter(Boolean));
  
  const genericExpenses = vehicle.lancamentos.filter(l => 
    !maintenanceLancamentoIds.has(l.id) && !refuelingLancamentoIds.has(l.id)
  );

  const selectedExpense = genericExpenses.find(e => e.id === selectedExpenseId);
  const viewExpense = genericExpenses.find(e => e.id === viewExpenseId);

  // Merge for timeline
  const timelineItems: TimelineItem[] = [
    ...vehicle.manutencoes.map(m => ({ ...m, type: "maintenance" as const })),
    ...genericExpenses.map(e => ({ ...e, type: "expense" as const })),
    ...vehicle.abastecimentos.map(a => ({ ...a, type: "refueling" as const }))
  ];

  // Sort refueling for view details (to get previous record)
  const sortedRefuelings = [...vehicle.abastecimentos].sort((a, b) => b.odometer - a.odometer);
  const viewRefuelingIndex = sortedRefuelings.findIndex((a) => a.id === viewRefuelingId);
  const viewRefueling = viewRefuelingIndex >= 0 ? sortedRefuelings[viewRefuelingIndex] : null;
  const previousRefueling = viewRefuelingIndex >= 0 ? sortedRefuelings[viewRefuelingIndex + 1] : undefined;

  // Find maintenance for view
  const viewMaintenance = vehicle.manutencoes.find((m) => m.id === viewMaintenanceId);

  // Handlers
  const handleEditRefueling = (id: string) => {
    setSelectedRefuelingId(id);
    setRefuelingDialogOpen(true);
  };

  const handleDeleteRefueling = (id: string) => {
    setItemToDelete({ type: "refueling", id });
    setDeleteDialogOpen(true);
  };

  const handleViewRefueling = (id: string) => {
    setViewRefuelingId(id);
    setViewRefuelingDialogOpen(true);
  };

  const handleEditMaintenance = (id: string) => {
    setSelectedMaintenanceId(id);
    setMaintenanceDialogOpen(true);
  };

  const handleDeleteMaintenance = (id: string) => {
    setItemToDelete({ type: "maintenance", id });
    setDeleteDialogOpen(true);
  };

  const handleViewMaintenance = (id: string) => {
    setViewMaintenanceId(id);
    setViewMaintenanceDialogOpen(true);
  };

  const handleEditTimelineItem = (item: TimelineItem) => {
    if (item.type === "maintenance") {
      setSelectedMaintenanceId(item.id);
      setMaintenanceDialogOpen(true);
    } else if (item.type === "refueling") {
      setSelectedRefuelingId(item.id);
      setRefuelingDialogOpen(true);
    } else {
      setSelectedExpenseId(item.id);
      setExpenseDialogOpen(true);
    }
  };

  const handleDeleteTimelineItem = (item: TimelineItem) => {
    setItemToDelete({ type: item.type, id: item.id });
    setDeleteDialogOpen(true);
  };

  const handleViewTimelineItem = (item: TimelineItem) => {
    if (item.type === "maintenance") {
      setViewMaintenanceId(item.id);
      setViewMaintenanceDialogOpen(true);
    } else if (item.type === "refueling") {
      setViewRefuelingId(item.id);
      setViewRefuelingDialogOpen(true);
    } else {
      setViewExpenseId(item.id);
      setViewExpenseDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    startTransition(async () => {
      try {
        let result;
        if (itemToDelete.type === "refueling") {
          result = await deleteRefuelingAction({ id: itemToDelete.id });
        } else if (itemToDelete.type === "maintenance") {
          result = await deleteMaintenanceAction({ id: itemToDelete.id });
        } else {
          // For generic expenses, use the generic delete action
          result = await deleteLancamentoActionOriginal({ id: itemToDelete.id });
        }

        if (result.success) {
          toast.success(result.message);
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          router.refresh();
        } else {
          toast.error(result.error ?? "Erro ao excluir registro.");
        }
      } catch (error) {
        toast.error("Erro inesperado ao excluir.");
      }
    });
  };

  // Find "Veículo" category for default selection
  const vehicleCategory = categoryOptions.find(c => c.label === "Veículo" || c.label === "Veiculo");
  const defaultCategoryId = vehicleCategory?.value;

  return (
    <>
      <div className="space-y-6 px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
            <p className="text-muted-foreground">
              {vehicle.brand} {vehicle.model}
              {vehicle.plate ? ` - ${vehicle.plate}` : ""}
            </p>
          </div>
          <MonthPicker />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            
            {/* Top Row: Monthly Summary & History */}
            <div className="grid gap-6 md:grid-cols-2">
              <VehicleMonthlySummaryCard 
                periodLabel={displayPeriod(periodString)}
                breakdown={monthlyBreakdown}
              />
              <VehicleHistoryCard data={historyData} />
            </div>

            {/* Middle Row: Efficiency Chart & Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <VehicleEfficiencyChart data={efficiencyData} />
                <VehicleReportStats 
                abastecimentos={sixMonthRefueling} 
                periodLabel="Métricas dos últimos 6 meses"
              />
            </div>

          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-col gap-4 items-start">
                <CardTitle>Histórico Completo</CardTitle>
                <div className="w-full flex flex-col sm:flex-row justify-start gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 size-4" />
                        Novo Registro
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => {
                        setSelectedRefuelingId(null);
                        setRefuelingDialogOpen(true);
                      }}>
                        <Fuel className="mr-2 size-4" />
                        Abastecimento
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedMaintenanceId(null);
                        setMaintenanceDialogOpen(true);
                      }}>
                        <Wrench className="mr-2 size-4" />
                        Manutenção
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedExpenseId(null);
                        setExpenseDialogOpen(true);
                      }}>
                        <FileText className="mr-2 size-4" />
                        Outros
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as any)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 size-4" />
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="refueling">Abastecimentos</SelectItem>
                      <SelectItem value="maintenance">Manutenções</SelectItem>
                      <SelectItem value="expense">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <VehicleTimelineCard 
                  items={timelineItems.filter((item) => filterType === "all" || item.type === filterType)}
                  onEdit={handleEditTimelineItem}
                  onDelete={handleDeleteTimelineItem}
                  onView={handleViewTimelineItem}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Refueling Dialog */}
      <RefuelingDetailsDialog
        open={viewRefuelingDialogOpen}
        onOpenChange={(open) => {
          setViewRefuelingDialogOpen(open);
          if (!open) setViewRefuelingId(null);
        }}
        refueling={viewRefueling}
        previousRefueling={previousRefueling}
        onEdit={handleEditRefueling}
        onDelete={handleDeleteRefueling}
      />

      {/* View Maintenance Dialog */}
      <MaintenanceDetailsDialog
        open={viewMaintenanceDialogOpen}
        onOpenChange={(open) => {
          setViewMaintenanceDialogOpen(open);
          if (!open) setViewMaintenanceId(null);
        }}
        maintenance={viewMaintenance}
        onEdit={handleEditMaintenance}
        onDelete={handleDeleteMaintenance}
      />

      {/* View Expense Dialog */}
      <VehicleExpenseDetailsDialog
        open={viewExpenseDialogOpen}
        onOpenChange={(open) => {
          setViewExpenseDialogOpen(open);
          if (!open) setViewExpenseId(null);
        }}
        expense={viewExpense}
        onEdit={(id) => {
          setSelectedExpenseId(id);
          setExpenseDialogOpen(true);
        }}
        onDelete={(id) => {
          setItemToDelete({ type: "expense", id });
          setDeleteDialogOpen(true);
        }}
      />

      {/* Edit Refueling Dialog */}
      <RefuelingFormDialog
        open={refuelingDialogOpen}
        onOpenChange={(open) => {
          setRefuelingDialogOpen(open);
          if (!open) setSelectedRefuelingId(null);
        }}
        veiculoId={vehicle.id}
        vehicleOptions={vehicleOptions}
        contaOptions={contaOptions}
        cartaoOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        defaultCategoryId={defaultCategoryId}
        initialData={
          selectedRefueling
            ? {
                id: selectedRefueling.id,
                veiculoId: selectedRefueling.veiculoId,
                date: formatDateForDb(new Date(selectedRefueling.date)),
                odometer: selectedRefueling.odometer,
                liters: Number(selectedRefueling.liters),
                pricePerLiter: Number(selectedRefueling.pricePerLiter),
                totalCost: Number(selectedRefueling.totalCost),
                fuelType: selectedRefueling.fuelType,
                isFullTank: selectedRefueling.isFullTank,
                paymentMethod: selectedRefueling.lancamento?.paymentMethod,
                condition: selectedRefueling.lancamento?.condition,
                installmentCount: selectedRefueling.lancamento?.installmentCount?.toString(),
                contaId: selectedRefueling.lancamento?.contaId,
                cartaoId: selectedRefueling.lancamento?.cartaoId,
                pagadorId: selectedRefueling.lancamento?.pagadorId,
                note: selectedRefueling.lancamento?.note,
              }
            : undefined
        }
      />

      {/* Edit Maintenance Dialog */}
      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={(open) => {
          setMaintenanceDialogOpen(open);
          if (!open) setSelectedMaintenanceId(null);
        }}
        defaultVehicleId={vehicle.id}
        vehicleOptions={vehicleOptions}
        accountOptions={contaOptions}
        cardOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        defaultCategoryId={defaultCategoryId}
        initialData={
          selectedMaintenance
            ? {
                id: selectedMaintenance.id,
                veiculoId: selectedMaintenance.veiculoId,
                date: formatDateForDb(new Date(selectedMaintenance.date)),
                odometer: selectedMaintenance.odometer,
                type: selectedMaintenance.type,
                serviceName: selectedMaintenance.serviceName,
                description: selectedMaintenance.description,
                parts: selectedMaintenance.parts,
                laborCost: Number(selectedMaintenance.laborCost),
                partsCost: Number(selectedMaintenance.partsCost),
                totalCost: Number(selectedMaintenance.totalCost),
                workshop: selectedMaintenance.workshop,
                nextMaintenanceKm: selectedMaintenance.nextMaintenanceKm,
                nextMaintenanceDate: selectedMaintenance.nextMaintenanceDate ? formatDateForDb(new Date(selectedMaintenance.nextMaintenanceDate)) : "",
                paymentMethod: selectedMaintenance.lancamento?.paymentMethod,
                condition: selectedMaintenance.lancamento?.condition,
                installmentCount: selectedMaintenance.lancamento?.installmentCount?.toString(),
                contaId: selectedMaintenance.lancamento?.contaId,
                cartaoId: selectedMaintenance.lancamento?.cartaoId,
                pagadorId: selectedMaintenance.lancamento?.pagadorId,
                note: selectedMaintenance.lancamento?.note,
              }
            : undefined
        }
      />

      {/* Expense Dialog */}
      <VehicleExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          setExpenseDialogOpen(open);
          if (!open) setSelectedExpenseId(null);
        }}
        vehicleId={vehicle.id}
        vehicleName={vehicle.name}
        accountOptions={contaOptions}
        cardOptions={cartaoOptions}
        pagadorOptions={pagadorOptions}
        categoryOptions={categoryOptions}
        defaultCategoryId={defaultCategoryId}
        initialData={
          selectedExpense
            ? {
                id: selectedExpense.id,
                veiculoId: selectedExpense.veiculoId ?? vehicle.id,
                date: formatDateForDb(new Date(selectedExpense.purchaseDate)),
                name: selectedExpense.name,
                amount: Math.abs(Number(selectedExpense.amount)),
                categoriaId: selectedExpense.categoriaId ?? "",
                paymentMethod: selectedExpense.paymentMethod,
                condition: selectedExpense.condition,
                installmentCount: selectedExpense.installmentCount?.toString(),
                contaId: selectedExpense.contaId ?? "",
                cartaoId: selectedExpense.cartaoId ?? "",
                pagadorId: selectedExpense.pagadorId ?? "",
                note: selectedExpense.note ?? "",
              }
            : undefined
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro
              e o lançamento financeiro associado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
