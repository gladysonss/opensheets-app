"use client";

import { sendPagadorSummaryAction } from "@/app/(dashboard)/pagadores/[pagadorId]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PAGADOR_ROLE_ADMIN } from "@/lib/pagadores/constants";
import { getAvatarSrc } from "@/lib/pagadores/utils";
import { cn } from "@/lib/utils/ui";
import {
  RiMailLine,
  RiMailSendLine,
  RiUser3Line,
  RiVerifiedBadgeFill,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

type PagadorInfo = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  status: string;
  note: string | null;
  role: string | null;
  isAutoSend: boolean;
  createdAt: string;
  lastMailAt: string | null;
  shareCode: string | null;
  canEdit: boolean;
};

type PagadorSummaryPreview = {
  periodLabel: string;
  totalExpenses: number;
  paymentSplits: {
    card: number;
    boleto: number;
    instant: number;
  };
  cardUsage: { name: string; amount: number }[];
  boletoStats: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paidCount: number;
    pendingCount: number;
  };
  lancamentoCount: number;
};

type PagadorInfoCardProps = {
  pagador: PagadorInfo;
  selectedPeriod: string;
  summary: PagadorSummaryPreview;
};

export function PagadorInfoCard({
  pagador,
  selectedPeriod,
  summary,
}: PagadorInfoCardProps) {
  const router = useRouter();
  const [isSending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const avatarSrc = getAvatarSrc(pagador.avatarUrl);
  const createdAtLabel = formatDate(pagador.createdAt);
  const isAdmin = pagador.role === PAGADOR_ROLE_ADMIN;

  const lastMailLabel = useMemo(() => {
    if (!pagador.lastMailAt) {
      return "Nunca enviado";
    }
    const date = new Date(pagador.lastMailAt);
    if (Number.isNaN(date.getTime())) {
      return "Nunca enviado";
    }
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }, [pagador.lastMailAt]);

  const disableSend = isSending || !pagador.email || !pagador.canEdit;

  const openConfirmDialog = () => {
    if (!pagador.email) {
      toast.error("Cadastre um e-mail para este pagador antes de enviar.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleSendSummary = () => {
    if (!pagador.email) {
      toast.error("Cadastre um e-mail para este pagador antes de enviar.");
      return;
    }

    startTransition(async () => {
      const result = await sendPagadorSummaryAction({
        pagadorId: pagador.id,
        period: selectedPeriod,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      setConfirmOpen(false);
      router.refresh();
    });
  };

  const getStatusBadgeVariant = (status: string): "success" | "secondary" => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "ativo") {
      return "success";
    }
    return "outline";
  };

  return (
    <Card className="border gap-4">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src={avatarSrc}
              alt={`Avatar de ${pagador.name}`}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl font-semibold text-foreground">
                {pagador.name}
              </CardTitle>
              {isAdmin ? (
                <RiVerifiedBadgeFill
                  className="size-4 text-sky-500"
                  aria-hidden
                />
              ) : null}
              {pagador.isAutoSend ? (
                <RiMailSendLine
                  className="size-4 text-primary"
                  aria-label="Envio automático habilitado"
                />
              ) : null}
            </div>
            <span className="text-sm text-muted-foreground">
              Criado em {createdAtLabel}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 lg:w-auto lg:items-end">
          {pagador.canEdit ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={openConfirmDialog}
                disabled={disableSend}
                className="w-full min-w-[180px] lg:w-auto"
              >
                {isSending ? "Enviando..." : "Enviar resumo"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Último envio: {lastMailLabel}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-amber-600">
              Acesso somente leitura
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 border-t border-dashed border-border/60 pt-6 text-sm sm:grid-cols-2">
        <InfoItem
          label="E-mail"
          value={
            pagador.email ? (
              <Link
                prefetch
                href={`mailto:${pagador.email}`}
                className="inline-flex items-center gap-2 text-primary"
              >
                <RiMailLine className="size-4" aria-hidden />
                {pagador.email}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <InfoItem
          label="Status"
          value={
            <Badge
              variant={getStatusBadgeVariant(pagador.status)}
              className="text-xs"
            >
              {pagador.status}
            </Badge>
          }
        />

        <InfoItem
          label="Papel"
          value={
            <span className="inline-flex items-center gap-2">
              <RiUser3Line className="size-4 text-muted-foreground" />
              {resolveRoleLabel(pagador.role)}
            </span>
          }
        />
        <InfoItem
          label="Envio automático"
          value={pagador.isAutoSend ? "Ativado" : "Desativado"}
        />
        {!pagador.email ? (
          <InfoItem
            label="Aviso"
            value={
              <span className="text-[13px] text-amber-700">
                Cadastre um e-mail para permitir o envio automático.
              </span>
            }
            className="sm:col-span-2"
          />
        ) : null}
        <InfoItem
          label="Observações"
          value={
            pagador.note ? (
              <span className="text-muted-foreground">{pagador.note}</span>
            ) : (
              "—"
            )
          }
          className="sm:col-span-2"
        />
      </CardContent>

      {pagador.canEdit ? (
        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => {
            if (isSending) return;
            setConfirmOpen(open);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirmar envio do resumo</DialogTitle>
              <DialogDescription>
                O resumo de{" "}
                <span className="font-semibold text-foreground">
                  {summary.periodLabel}
                </span>{" "}
                será enviado para{" "}
                <span className="font-medium text-foreground">
                  {pagador.email ?? "—"}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground/70">
                  Totais do mês
                </span>
                <p className="text-foreground">
                  {formatCurrency(summary.totalExpenses)} em despesas
                  registradas
                </p>
                <p className="text-xs">
                  Cartões: {formatCurrency(summary.paymentSplits.card)} •
                  Boletos: {formatCurrency(summary.paymentSplits.boleto)} •
                  Pix/Débito/Dinheiro:{" "}
                  {formatCurrency(summary.paymentSplits.instant)}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground/70">
                  Principais cartões
                </span>
                <p>
                  {summary.cardUsage.length
                    ? summary.cardUsage
                        .map(
                          (item) =>
                            `${item.name}: ${formatCurrency(item.amount)}`
                        )
                        .join(" • ")
                    : "Sem lançamentos com cartão no período."}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground/70">
                    Boletos
                  </span>
                  <p>
                    Pagos: {formatCurrency(summary.boletoStats.paidAmount)} (
                    {summary.boletoStats.paidCount})
                  </p>
                  <p>
                    Pendentes:{" "}
                    {formatCurrency(summary.boletoStats.pendingAmount)} (
                    {summary.boletoStats.pendingCount})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Inclui {summary.lancamentoCount} lançamentos.</span>
                <span>Último envio: {lastMailLabel}</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSending}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSendSummary}
                disabled={disableSend}
              >
                {isSending ? "Enviando..." : "Confirmar envio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </Card>
  );
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const resolveRoleLabel = (role: string | null) => {
  if (role === PAGADOR_ROLE_ADMIN) return "Administrador";
  return "Pagador";
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

type InfoItemProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function InfoItem({ label, value, className }: InfoItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
      <div className="text-base text-foreground">{value}</div>
    </div>
  );
}
