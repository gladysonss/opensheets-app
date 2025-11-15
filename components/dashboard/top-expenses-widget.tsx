"use client";

import MoneyValues from "@/components/money-values";
import { Switch } from "@/components/ui/switch";
import type { TopExpense, TopExpensesData } from "@/lib/dashboard/expenses/top-expenses";
import { RiArrowUpDoubleLine } from "@remixicon/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { WidgetEmptyState } from "../widget-empty-state";

type TopExpensesWidgetProps = {
  allExpenses: TopExpensesData;
  cardOnlyExpenses: TopExpensesData;
};

const resolveLogoPath = (logo: string | null) => {
  if (!logo) {
    return null;
  }
  if (/^(https?:\/\/|data:)/.test(logo)) {
    return logo;
  }
  return logo.startsWith("/") ? logo : `/logos/${logo}`;
};

const buildInitials = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "LC";
  }
  if (parts.length === 1) {
    const firstPart = parts[0];
    return firstPart ? firstPart.slice(0, 2).toUpperCase() : "LC";
  }
  const firstChar = parts[0]?.[0] ?? "";
  const secondChar = parts[1]?.[0] ?? "";
  return `${firstChar}${secondChar}`.toUpperCase() || "LC";
};

const formatTransactionDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

  const formatted = formatter.format(date);
  // Capitaliza a primeira letra do dia da semana
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const shouldIncludeExpense = (expense: TopExpense) => {
  const normalizedName = expense.name.trim().toLowerCase();

  if (normalizedName === "saldo inicial") {
    return false;
  }

  if (normalizedName.includes("fatura")) {
    return false;
  }

  return true;
};

const isCardExpense = (expense: TopExpense) =>
  expense.paymentMethod?.toLowerCase().includes("cartão") ?? false;

export function TopExpensesWidget({
  allExpenses,
  cardOnlyExpenses,
}: TopExpensesWidgetProps) {
  const [cardOnly, setCardOnly] = useState(false);
  const normalizedAllExpenses = useMemo(() => {
    return allExpenses.expenses.filter(shouldIncludeExpense);
  }, [allExpenses]);

  const normalizedCardOnlyExpenses = useMemo(() => {
    const merged = [...cardOnlyExpenses.expenses, ...normalizedAllExpenses];
    const seen = new Set<string>();

    return merged.filter((expense) => {
      if (seen.has(expense.id)) {
        return false;
      }

      if (!isCardExpense(expense) || !shouldIncludeExpense(expense)) {
        return false;
      }

      seen.add(expense.id);
      return true;
    });
  }, [cardOnlyExpenses, normalizedAllExpenses]);

  const data = cardOnly
    ? { expenses: normalizedCardOnlyExpenses }
    : { expenses: normalizedAllExpenses };

  return (
    <div className="flex flex-col gap-4 px-0">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="card-only-toggle"
          className="text-sm text-muted-foreground"
        >
          {cardOnly
            ? "Somente cartões de crédito ou débito."
            : "Todas as despesas"}
        </label>
        <Switch
          id="card-only-toggle"
          checked={cardOnly}
          onCheckedChange={setCardOnly}
        />
      </div>

      {data.expenses.length === 0 ? (
        <div className="-mt-10">
          <WidgetEmptyState
            icon={
              <RiArrowUpDoubleLine className="size-6 text-muted-foreground" />
            }
            title="Nenhuma despesa encontrada"
            description="Quando houver despesas registradas, elas aparecerão aqui."
          />
        </div>
      ) : (
        <ul className="flex flex-col">
          {data.expenses.map((expense) => {
            const logo = resolveLogoPath(expense.logo);
            const initials = buildInitials(expense.name);

            return (
              <li
                key={expense.id}
                className="flex items-center justify-between gap-3 border-b border-dashed py-2 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={`Logo de ${expense.name}`}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase text-muted-foreground">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {expense.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTransactionDate(expense.purchaseDate)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-foreground">
                  <MoneyValues amount={expense.amount} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
