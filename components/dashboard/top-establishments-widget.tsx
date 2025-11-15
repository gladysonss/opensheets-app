import MoneyValues from "@/components/money-values";
import type { TopEstablishmentsData } from "@/lib/dashboard/top-establishments";
import { RiStore2Line } from "@remixicon/react";
import Image from "next/image";
import { WidgetEmptyState } from "../widget-empty-state";

type TopEstablishmentsWidgetProps = {
  data: TopEstablishmentsData;
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

const formatOccurrencesLabel = (occurrences: number) => {
  if (occurrences === 1) {
    return "1 lançamento";
  }
  return `${occurrences} lançamentos`;
};

export function TopEstablishmentsWidget({
  data,
}: TopEstablishmentsWidgetProps) {
  return (
    <div className="flex flex-col px-0">
      {data.establishments.length === 0 ? (
        <WidgetEmptyState
          icon={<RiStore2Line className="size-6 text-muted-foreground" />}
          title="Nenhum estabelecimento encontrado"
          description="Quando houver despesas registradas, elas aparecerão aqui."
        />
      ) : (
        <ul className="flex flex-col">
          {data.establishments.map((establishment) => {
            const logo = resolveLogoPath(establishment.logo);
            const initials = buildInitials(establishment.name);

            return (
              <li
                key={establishment.id}
                className="flex items-center justify-between gap-3 border-b border-dashed py-2 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={`Logo de ${establishment.name}`}
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
                      {establishment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatOccurrencesLabel(establishment.occurrences)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-foreground">
                  <MoneyValues amount={establishment.amount} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
