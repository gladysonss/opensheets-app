"use client";

import { deleteAccountAction } from "@/app/(dashboard)/ajustes/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { RiAlertLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function DeleteAccountForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccountAction({
        confirmation,
      });

      if (result.success) {
        toast.success(result.message);
        // Fazer logout e redirecionar para página de login
        await authClient.signOut();
        router.push("/");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleOpenModal = () => {
    setConfirmation("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setConfirmation("");
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <RiAlertLine className="size-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-1">
            <h3 className="font-medium text-destructive">
              Remoção definitiva de conta
            </h3>
            <p className="text-sm text-foreground">
              Ao prosseguir, sua conta e todos os dados associados serão
              excluídos de forma irreversível.
            </p>
          </div>
        </div>

        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-8">
          <li>Lançamentos, anexos e notas</li>
          <li>Contas, cartões, orçamentos e categorias</li>
          <li>Pagadores (incluindo o pagador padrão)</li>
          <li>Preferências e configurações</li>
        </ul>

        <Button
          variant="destructive"
          onClick={handleOpenModal}
          disabled={isPending}
        >
          Deletar conta
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => {
            if (isPending) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (isPending) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Você tem certeza?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente
              sua conta e remover seus dados de nossos servidores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Para confirmar, digite <strong>DELETAR</strong> no campo abaixo.
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={isPending}
                placeholder="DELETAR"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || confirmation !== "DELETAR"}
            >
              {isPending ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
