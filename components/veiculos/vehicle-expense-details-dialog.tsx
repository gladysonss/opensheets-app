"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { FileText } from "lucide-react";

interface VehicleExpenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any; // Using any for simplicity as Lancamento type might be complex with relations
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function VehicleExpenseDetailsDialog({
  open,
  onOpenChange,
  expense,
  onEdit,
  onDelete,
}: VehicleExpenseDetailsDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-green-500" />
            Detalhes da Despesa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(Math.abs(Number(expense.amount)))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(expense.purchaseDate)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Descrição</p>
                <p className="font-medium">{expense.name}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Categoria</p>
                <p>{expense.category?.name || "Sem categoria"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Pagamento</p>
                <p>{expense.paymentMethod}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Condição</p>
                <p>
                  {expense.condition}
                  {expense.installmentCount && ` (${expense.installmentCount}x)`}
                </p>
              </div>
            </div>

            {expense.note && (
              <div>
                <p className="font-medium text-muted-foreground">Observações</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {expense.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
