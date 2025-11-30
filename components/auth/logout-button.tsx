'use client';
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onRequest: (_ctx) => {
          setLoading(true);
        },
        onResponse: (_ctx) => {
          setLoading(false);
        },
      },
    });
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="link"
          size="sm"
          aria-busy={loading}
          data-loading={loading}
          onClick={handleLogOut}
          disabled={loading}
          className="text-destructive transition-all duration-200 border hover:text-destructive focus-visible:ring-destructive/30 data-[loading=true]:opacity-90"
        >
          {loading && <Spinner className="size-3.5 text-destructive" />}
          <span aria-live="polite">{loading ? "Saindo" : "Sair"}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        Encerrar sessão
      </TooltipContent>
    </Tooltip>
  );
}
