"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/ui";
import Image from "next/image";

import { deriveNameFromLogo } from "@/lib/logo";

const DEFAULT_BASE_PATH = "/logos";

const resolveLogoSrc = (logo: string, basePath: string) => {
  if (/^https?:\/\//.test(logo)) {
    return logo;
  }
  return `${basePath.replace(/\/$/, "")}/${logo.replace(/^\//, "")}`;
};

interface LogoPickerTriggerProps {
  selectedLogo?: string | null;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  basePath?: string;
  onOpen: () => void;
  className?: string;
}

export function LogoPickerTrigger({
  selectedLogo,
  disabled,
  helperText = "Clique para trocar o logo",
  placeholder = "Selecionar logo",
  basePath = DEFAULT_BASE_PATH,
  onOpen,
  className,
}: LogoPickerTriggerProps) {
  const hasLogo = Boolean(selectedLogo);
  const selectedLogoLabel = deriveNameFromLogo(selectedLogo);
  const selectedLogoPath =
    hasLogo && selectedLogo ? resolveLogoSrc(selectedLogo, basePath) : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-background shadow-xs">
        {selectedLogoPath ? (
          <Image
            src={selectedLogoPath}
            alt={selectedLogoLabel || "Logo selecionado"}
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-muted-foreground">{placeholder}</span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground">
          {selectedLogoLabel || placeholder}
        </span>
        <span className="text-xs text-muted-foreground">
          {disabled ? "Nenhum logo disponível" : helperText}
        </span>
      </span>
    </button>
  );
}

interface LogoPickerDialogProps {
  open: boolean;
  logos: string[];
  value: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (logo: string) => void;
  basePath?: string;
  title?: string;
  description?: string;
  emptyState?: React.ReactNode;
}

export function LogoPickerDialog({
  open,
  logos,
  value,
  onOpenChange,
  onSelect,
  basePath = DEFAULT_BASE_PATH,
  title = "Escolher logo",
  description = "Selecione o logo que será usado para identificar este item.",
  emptyState,
}: LogoPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {logos.length === 0 ? (
          emptyState ?? (
            <p className="text-sm text-muted-foreground">
              Nenhum logo encontrado. Adicione arquivos na pasta de logos.
            </p>
          )
        ) : (
          <div className="grid max-h-72 grid-cols-3 gap-4 overflow-y-auto p-1 sm:grid-cols-4">
            {logos.map((logo) => {
              const isActive = value === logo;
              const logoLabel = deriveNameFromLogo(logo);

              return (
                <button
                  type="button"
                  key={logo}
                  onClick={() => onSelect(logo)}
                  className={cn(
                    "flex flex-col items-center gap-2 border rounded-lg bg-card p-2 text-center text-xs transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive &&
                      "border-primary bg-primary/5 ring-2 ring-primary/40"
                  )}
                >
                  <span className="flex w-full items-center justify-center overflow-hidden rounded-lg">
                    <Image
                      src={resolveLogoSrc(logo, basePath)}
                      alt={logoLabel || logo}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  </span>
                  <span className="line-clamp-2 leading-tight text-muted-foreground">
                    {logoLabel}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
