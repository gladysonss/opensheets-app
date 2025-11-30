'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateApiToken } from "./actions";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState, useActionState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ApiTokenCardProps {
  token: string | null;
}

const initialState = {
  token: null as string | null,
  error: null as string | null,
};

export function ApiTokenCard({ token: initialToken }: ApiTokenCardProps) {
  const [state, formAction] = useActionState(generateApiToken, initialState);
  const [token, setToken] = useState(initialToken);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  useEffect(() => {
    if (state.token) {
      setToken(state.token);
      toast.success("Sucesso!", {
        description: "Seu novo token de API foi gerado.",
      });
    }
    if (state.error) {
      toast.error("Erro", {
        description: state.error,
      });
    }
  }, [state]);

  function copyToClipboard() {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Copiado!", {
        description: "O token foi copiado para a área de transferência.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token de API</CardTitle>
        <CardDescription>
          Use este token para integrar suas contas com serviços externos. Cuidado,
          o token dá acesso aos seus dados. Não o compartilhe com ninguém.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-token">Seu Token</Label>
            <div className="flex items-center gap-2">
              <Input
                id="api-token"
                type={isTokenVisible ? 'text' : 'password'}
                readOnly
                value={token ?? 'Nenhum token gerado ainda'}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsTokenVisible((prev) => !prev)}
                disabled={!token}
              >
                {isTokenVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {isTokenVisible ? 'Esconder token' : 'Mostrar token'}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copyToClipboard}
                disabled={!token}
              >
                Copiar
              </Button>
            </div>
          </div>
          <Button type="submit">Gerar Novo Token</Button>
        </form>
      </CardContent>
    </Card>
  );
}
