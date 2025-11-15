"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/ui";
import { type VariantProps } from "class-variance-authority";
import { useCallback, useMemo, useState, useTransition } from "react";

interface ConfirmActionDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  pendingLabel,
  confirmVariant = "default",
  open,
  onOpenChange,
  onConfirm,
  disabled = false,
  className,
}: ConfirmActionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogOpen = open ?? internalOpen;

  const setDialogOpen = useCallback(
    (value: boolean) => {
      if (open === undefined) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [onOpenChange, open]
  );

  const resolvedPendingLabel = useMemo(
    () => pendingLabel ?? confirmLabel,
    [pendingLabel, confirmLabel]
  );

  const handleConfirm = useCallback(() => {
    if (!onConfirm) {
      setDialogOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await onConfirm();
        setDialogOpen(false);
      } catch {
        // Mantém o diálogo aberto para que o chamador trate o erro.
      }
    });
  }, [onConfirm, setDialogOpen]);

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending || disabled}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending || disabled}
            className={cn(
              buttonVariants({ variant: confirmVariant }),
              "w-full sm:w-auto"
            )}
          >
            {isPending ? resolvedPendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
