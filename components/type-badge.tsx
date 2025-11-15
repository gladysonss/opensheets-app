import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/ui";
import DotIcon from "./dot-icon";

type TypeBadgeType =
  | "receita"
  | "despesa"
  | "Receita"
  | "Despesa"
  | "Transferência"
  | "transferência";

interface TypeBadgeProps {
  type: TypeBadgeType;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
  Receita: "Receita",
  Despesa: "Despesa",
  Transferência: "Transferência",
  transferência: "Transferência",
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const normalizedType = type.toLowerCase();
  const isReceita = normalizedType === "receita";
  const isTransferencia = normalizedType === "transferência";
  const label = TYPE_LABELS[type] || type;

  const colorClass = isTransferencia
    ? "text-blue-700 dark:text-blue-400"
    : isReceita
    ? "text-green-700  dark:text-green-400"
    : "text-red-700 dark:text-red-400";

  const dotColor = isTransferencia
    ? "bg-blue-700 dark:bg-blue-400"
    : isReceita
    ? "bg-green-600 dark:bg-green-400"
    : "bg-red-600 dark:bg-red-400";

  return (
    <Badge
      variant={"outline"}
      className={cn(
        "flex items-center gap-1 px-2 text-xs",
        colorClass,
        className
      )}
    >
      <DotIcon bg_dot={dotColor} />
      {label}
    </Badge>
  );
}
