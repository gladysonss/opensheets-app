"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/ui";
import { useMemo, type ReactNode } from "react";
import type { CalendarDay, CalendarEvent } from "@/components/calendario/types";
import { parseDateKey } from "@/components/calendario/utils";
import { EVENT_TYPE_STYLES } from "@/components/calendario/day-cell";
import { currencyFormatter } from "@/lib/lancamentos/formatting-helpers";

type EventModalProps = {
  open: boolean;
  day: CalendarDay | null;
  onClose: () => void;
  onCreate: (date: string) => void;
};

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const capitalize = (value: string) =>
  value.length > 0 ? value[0]?.toUpperCase().concat(value.slice(1)) : value;

const formatCurrency = (value: number, isReceita: boolean) => {
  const formatted = currencyFormatter.format(value ?? 0);
  return isReceita ? `+${formatted}` : formatted;
};

const EventCard = ({
  children,
  type,
}: {
  children: ReactNode;
  type: CalendarEvent["type"];
}) => {
  const style = EVENT_TYPE_STYLES[type];
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card/85 p-4">
      <span
        className={cn("mt-1 size-2.5 shrink-0 rounded-full", style.dot)}
        aria-hidden
      />
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
};

const renderLancamento = (
  event: Extract<CalendarEvent, { type: "lancamento" }>
) => {
  const isReceita = event.lancamento.transactionType === "Receita";
  const subtitleParts = [
    event.lancamento.categoriaName,
    event.lancamento.paymentMethod,
    event.lancamento.pagadorName,
  ].filter(Boolean);

  return (
    <EventCard type="lancamento">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{event.lancamento.name}</span>
          {subtitleParts.length ? (
            <span className="text-xs text-muted-foreground">
              {subtitleParts.join(" • ")}
            </span>
          ) : null}
        </div>
        <span
          className={cn(
            "text-sm font-semibold",
            isReceita ? "text-emerald-600" : "text-foreground"
          )}
        >
          {formatCurrency(event.lancamento.amount, isReceita)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5">
          {capitalize(event.lancamento.transactionType)}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5">
          {event.lancamento.condition}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5">
          {event.lancamento.paymentMethod}
        </span>
      </div>
    </EventCard>
  );
};

const renderBoleto = (event: Extract<CalendarEvent, { type: "boleto" }>) => {
  const isPaid = Boolean(event.lancamento.isSettled);
  const dueDate = event.lancamento.dueDate;
  const formattedDueDate = dueDate
    ? new Intl.DateTimeFormat("pt-BR").format(new Date(dueDate))
    : null;

  return (
    <EventCard type="boleto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{event.lancamento.name}</span>
          <span className="text-xs text-muted-foreground">
            Boleto{formattedDueDate ? ` • Vence em ${formattedDueDate}` : ""}
          </span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {currencyFormatter.format(event.lancamento.amount ?? 0)}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
          isPaid
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
        )}
      >
        {isPaid ? "Pago" : "Pendente"}
      </span>
    </EventCard>
  );
};

const renderCard = (event: Extract<CalendarEvent, { type: "cartao" }>) => (
  <EventCard type="cartao">
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Cartão {event.card.name}</span>
        <span className="text-xs text-muted-foreground">
          Vencimento dia {event.card.dueDay}
        </span>
      </div>
      {event.card.totalDue !== null ? (
        <span className="text-sm font-semibold text-foreground">
          {currencyFormatter.format(event.card.totalDue)}
        </span>
      ) : null}
    </div>
    <div className="flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
      <span className="rounded-full bg-muted px-2 py-0.5">
        Status: {event.card.status ?? "Indefinido"}
      </span>
      {event.card.closingDay ? (
        <span className="rounded-full bg-muted px-2 py-0.5">
          Fechamento dia {event.card.closingDay}
        </span>
      ) : null}
    </div>
  </EventCard>
);

const renderEvent = (event: CalendarEvent) => {
  switch (event.type) {
    case "lancamento":
      return renderLancamento(event);
    case "boleto":
      return renderBoleto(event);
    case "cartao":
      return renderCard(event);
    default:
      return null;
  }
};

export function EventModal({ open, day, onClose, onCreate }: EventModalProps) {
  const formattedDate = useMemo(() => {
    if (!day) return "";
    const parsed = parseDateKey(day.date);
    return capitalize(fullDateFormatter.format(parsed));
  }, [day]);

  const handleCreate = () => {
    if (!day) return;
    onClose();
    onCreate(day.date);
  };

  const description = day?.events.length
    ? "Confira os lançamentos e vencimentos cadastrados para este dia."
    : "Nenhum lançamento encontrado para este dia. Você pode criar um novo lançamento agora.";

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-2">
          {day?.events.length ? (
            day.events.map((event) => (
              <div key={event.id}>{renderEvent(event)}</div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Nenhum lançamento ou vencimento registrado. Clique em{" "}
              <span className="font-medium text-primary">Novo lançamento</span>{" "}
              para começar.
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!day}>
            Novo lançamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
