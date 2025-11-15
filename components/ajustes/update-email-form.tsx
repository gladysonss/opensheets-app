"use client";

import { updateEmailAction } from "@/app/(dashboard)/ajustes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type UpdateEmailFormProps = {
  currentEmail: string;
};

export function UpdateEmailForm({ currentEmail }: UpdateEmailFormProps) {
  const [isPending, startTransition] = useTransition();
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateEmailAction({
        newEmail,
        confirmEmail,
      });

      if (result.success) {
        toast.success(result.message);
        setNewEmail("");
        setConfirmEmail("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newEmail">Novo e-mail</Label>
        <Input
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isPending}
          placeholder={currentEmail}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmEmail">Confirmar novo e-mail</Label>
        <Input
          id="confirmEmail"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          disabled={isPending}
          placeholder="repita o e-mail"
          required
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Atualizando..." : "Atualizar e-mail"}
      </Button>
    </form>
  );
}
