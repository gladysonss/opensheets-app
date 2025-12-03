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
  Fuel, 
  Gauge, 
  MapPin, 
  Pencil, 
  Trash2, 
  Calendar, 
  User, 
  Droplets,
  CreditCard,
  Banknote
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RefuelingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refueling: any;
  previousRefueling?: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RefuelingDetailsDialog({
  open,
  onOpenChange,
  refueling,
  previousRefueling,
  onEdit,
  onDelete,
}: RefuelingDetailsDialogProps) {
  if (!refueling) return null;

  // Calculate metrics
  const distance = previousRefueling 
    ? refueling.odometer - previousRefueling.odometer 
    : 0;
  
  const liters = Number(refueling.liters);
  const totalCost = Number(refueling.totalCost);
  
  let efficiency: number | null = null;
  if (distance > 0 && liters > 0) {
    const eff = distance / liters;
    if (eff < 150) { // Outlier filter
      efficiency = eff;
    }
  }

  const pricePerKm = distance > 0 ? totalCost / distance : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[85vh] overflow-y-auto">
        {/* Header with Actions */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-primary-foreground">
          <div className="flex items-center gap-2">
            <Fuel className="size-5" />
            <DialogTitle className="text-lg font-medium">Detalhes do Abastecimento</DialogTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => {
                onOpenChange(false);
                onDelete(refueling.id);
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
                onEdit(refueling.id);
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Cost Display */}
          <div className="text-center space-y-1">
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Custo Total</span>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(totalCost)}
            </div>
          </div>

          {/* Odometer & Distance */}
          <div className="flex justify-between items-center px-4 py-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Gauge className="size-4 text-muted-foreground" />
              <span className="font-medium">{refueling.odometer.toLocaleString('pt-BR')} km</span>
            </div>
            {distance > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="font-medium">+{distance} km</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex justify-center items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{friendlyDate(new Date(refueling.date))}</span>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="space-y-4">
            <h3 className="font-medium text-orange-500 flex items-center gap-2">
              <Droplets className="size-4" />
              {refueling.fuelType}
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Preço / L</span>
                <span className="font-medium">{formatCurrency(Number(refueling.pricePerLiter))}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Custo Total</span>
                <span className="font-medium">{formatCurrency(totalCost)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Volume</span>
                <span className="font-medium">{Number(refueling.liters).toFixed(3)} L</span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
               <div className="text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">Tanque Completo</span>
                  <span className={cn("font-medium", refueling.isFullTank ? "text-green-600" : "text-amber-600")}>
                    {refueling.isFullTank ? "Sim" : "Não"}
                  </span>
               </div>
            </div>
          </div>

          <Separator />

          {/* Efficiency Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Eficiência</span>
              <div className="text-xl font-bold">
                {efficiency ? `${efficiency.toFixed(3)} km/L` : "---"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Preço / Km</span>
              <div className="text-xl font-bold">
                {pricePerKm > 0 ? formatCurrency(pricePerKm) : "---"}
              </div>
            </div>
          </div>



        </div>
      </DialogContent>
    </Dialog>
  );
}
