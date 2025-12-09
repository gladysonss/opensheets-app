"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createInvite, deleteInvite, getInvites } from "./actions";
import { Badge } from "@/components/ui/badge";

export default function ConvitesPage() {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    try {
      const data = await getInvites();
      setInvites(data);
    } catch (error) {
      toast.error("Erro ao carregar convites");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await createInvite(email);
      if (res.success) {
        toast.success("Convite criado com sucesso!");
        setEmail("");
        const link = `${window.location.origin}/signup?token=${res.token}`;
        setGeneratedLink(link);
        loadInvites();
      }
    } catch (error) {
      toast.error("Erro ao criar convite");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja apagar este convite?")) return;
    try {
      await deleteInvite(id);
      toast.success("Convite removido");
      loadInvites();
    } catch (error) {
      toast.error("Erro ao remover convite");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Convites</h1>
        <p className="text-muted-foreground">
          Gerencie quem pode criar conta no seu servidor.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Novo Convite</CardTitle>
            <CardDescription>
              Gere um link único de cadastro para um e-mail específico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Gerando..." : "Gerar"}
                </Button>
              </div>
              
              {generatedLink && (
                 <div className="p-4 bg-muted rounded-md flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                   <span className="text-sm font-medium text-muted-foreground">Link de Convite:</span>
                   <div className="flex items-center gap-2">
                     <code className="flex-1 p-2 bg-background rounded border text-xs break-all">
                       {generatedLink}
                     </code>
                     <Button size="icon" variant="outline" type="button" onClick={() => copyToClipboard(generatedLink)}>
                       <Copy className="h-4 w-4" />
                     </Button>
                   </div>
                   <p className="text-xs text-muted-foreground">Esse link expira em 7 dias.</p>
                 </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>Convites ativos e passados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                       Nenhum convite encontrado.
                     </TableCell>
                   </TableRow>
                )}
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{invite.email}</span>
                        <span className="text-xs text-muted-foreground">
                          Expira em {format(new Date(invite.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        invite.status === 'used' ? 'secondary' :
                        invite.status === 'expired' ? 'destructive' :
                        'default'
                      }>
                        {invite.status === 'used' ? 'Usado' :
                         invite.status === 'expired' ? 'Expirado' :
                         'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(invite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
