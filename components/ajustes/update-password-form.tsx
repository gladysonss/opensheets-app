"use client";

import { updatePasswordAction } from "@/app/(dashboard)/ajustes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updatePasswordAction({
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        toast.success(result.message);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            placeholder="Mínimo de 6 caracteres"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showNewPassword ? (
              <RiEyeOffLine size={20} />
            ) : (
              <RiEyeLine size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            placeholder="Repita a senha"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <RiEyeOffLine size={20} />
            ) : (
              <RiEyeLine size={20} />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Atualizando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
