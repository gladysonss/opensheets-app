"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, friendlyDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/ui";
import { 
  Wrench, 
  Gauge, 
  MapPin, 
  Pencil, 
  Trash2, 
  Calendar, 
  CarFront,
  ClipboardList,
  Banknote
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MaintenanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MaintenanceDetailsDialog({
  open,
  onOpenChange,
  maintenance,
  onEdit,
  onDelete,
}: MaintenanceDetailsDialogProps) {
  if (!maintenance) return null;

  const totalCost = Number(maintenance.totalCost);
  const laborCost = maintenance.laborCost ? Number(maintenance.laborCost) : 0;
  const partsCost = maintenance.partsCost ? Number(maintenance.partsCost) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[85vh] overflow-y-auto">
        {/* Header with Actions */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-primary-foreground">
          <div className="flex items-center gap-2">
            <Wrench className="size-5" />
            <DialogTitle className="text-lg font-medium">Detalhes da Manutenção</DialogTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => {
                onOpenChange(false);
                onDelete(maintenance.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => {
                onOpenChange(false);
                onEdit(maintenance.id);
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Date */}
          <div className="flex justify-center items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{friendlyDate(new Date(maintenance.date))}</span>
          </div>

          <Separator />

          {/* Service Details Grid */}
          <div className="space-y-4">
             <div className="flex justify-center text-center">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">Tipo de Serviço</span>
                    <span className="font-medium">{maintenance.serviceName}</span>
                </div>
             </div>

             {/* Breakdown if available */}
             {(laborCost > 0 || partsCost >= 0) && (
                <div className="grid grid-cols-2 gap-4 text-center pt-2">
                    {laborCost > 0 && (
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">Mão de Obra</span>
                            <span className="font-medium">{formatCurrency(laborCost)}</span>
                        </div>
                    )}
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Peças</span>
                        <span className="font-medium">{formatCurrency(partsCost)}</span>
                    </div>
                </div>
             )}
          </div>

          <Separator />

          {/* Odometer & Total Cost */}
          <div className="grid grid-cols-2 gap-4 text-center">
             <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Odômetro</span>
                <div className="text-xl font-bold">
                   {maintenance.odometer.toLocaleString('pt-BR')} km
                </div>
             </div>
             <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Custo Total</span>
                <div className="text-xl font-bold text-primary">
                   {formatCurrency(totalCost)}
                </div>
             </div>
          </div>
          
          <Separator />

          {/* Additional Info */}
          <div className="space-y-3 text-sm">
             {maintenance.workshop && (
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Oficina</span>
                   <span className="font-medium">{maintenance.workshop}</span>
                </div>
             )}
             {maintenance.description && (
                <div className="flex flex-col gap-1">
                   <span className="text-muted-foreground">Descrição</span>
                   <span className="font-medium text-muted-foreground/80 italic">{maintenance.description}</span>
                </div>
             )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
