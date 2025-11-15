import MoneyValues from "@/components/money-values";
import type { RecentTransactionsData } from "@/lib/dashboard/recent-transactions";
import { RiExchangeLine } from "@remixicon/react";
import Image from "next/image";
import { WidgetEmptyState } from "../widget-empty-state";

type RecentTransactionsWidgetProps = {
  data: RecentTransactionsData;
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

export function RecentTransactionsWidget({
  data,
}: RecentTransactionsWidgetProps) {
  return (
    <div className="flex flex-col px-0">
      {data.transactions.length === 0 ? (
        <WidgetEmptyState
          icon={<RiExchangeLine className="size-6 text-muted-foreground" />}
          title="Nenhum lançamento encontrado"
          description="Quando houver despesas registradas, elas aparecerão aqui."
        />
      ) : (
        <ul className="flex flex-col">
          {data.transactions.map((transaction) => {
            const logo = resolveLogoPath(
              transaction.cardLogo ?? transaction.accountLogo
            );
            const initials = buildInitials(transaction.name);

            return (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-3 border-b border-dashed py-2 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={`Logo de ${transaction.name}`}
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
                      {transaction.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTransactionDate(transaction.purchaseDate)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-foreground">
                  <MoneyValues amount={transaction.amount} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
