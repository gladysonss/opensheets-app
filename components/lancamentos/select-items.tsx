"use client";

import { CategoryIcon } from "@/components/categorias/category-icon";
import DotIcon from "@/components/dot-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/lib/pagadores/utils";
import { getConditionIcon, getPaymentMethodIcon } from "@/lib/utils/icons";
import { RiBankCard2Line, RiBankLine } from "@remixicon/react";
import Image from "next/image";

type SelectItemContentProps = {
  label: string;
  avatarUrl?: string | null;
  logo?: string | null;
  icon?: string | null;
};

export function PagadorSelectContent({
  label,
  avatarUrl,
}: SelectItemContentProps) {
  const avatarSrc = getAvatarSrc(avatarUrl);
  const initial = label.charAt(0).toUpperCase() || "?";

  return (
    <span className="flex items-center gap-2">
      <Avatar className="size-5 border border-border/60 bg-background">
        <AvatarImage src={avatarSrc} alt={`Avatar de ${label}`} />
        <AvatarFallback className="text-[10px] font-medium uppercase">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span>{label}</span>
    </span>
  );
}

export function CategoriaSelectContent({
  label,
  icon,
}: SelectItemContentProps) {
  return (
    <span className="flex items-center gap-2">
      <CategoryIcon name={icon} className="size-4" />
      <span>{label}</span>
    </span>
  );
}

export function TransactionTypeSelectContent({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    Receita: "bg-emerald-600 dark:bg-emerald-400",
    Despesa: "bg-red-600 dark:bg-red-400",
    Transferência: "bg-blue-600 dark:bg-blue-400",
  };

  return (
    <span className="flex items-center gap-2">
      <DotIcon bg_dot={colorMap[label]} />
      <span>{label}</span>
    </span>
  );
}

export function PaymentMethodSelectContent({ label }: { label: string }) {
  const icon = getPaymentMethodIcon(label);

  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </span>
  );
}

export function ConditionSelectContent({ label }: { label: string }) {
  const icon = getConditionIcon(label);

  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </span>
  );
}

export function ContaCartaoSelectContent({
  label,
  logo,
  isCartao,
}: SelectItemContentProps & { isCartao?: boolean }) {
  const resolveLogoSrc = (logoPath: string | null) => {
    if (!logoPath) {
      return null;
    }

    const fileName = logoPath.split("/").filter(Boolean).pop() ?? logoPath;
    return `/logos/${fileName}`;
  };

  const logoSrc = resolveLogoSrc(logo);
  const Icon = isCartao ? RiBankCard2Line : RiBankLine;

  return (
    <span className="flex items-center gap-2">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`Logo de ${label}`}
          width={20}
          height={20}
          className="rounded"
        />
      ) : (
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      )}
      <span>{label}</span>
    </span>
  );
}
