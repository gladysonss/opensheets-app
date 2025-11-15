"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/ui";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { usePrivacyMode } from "./privacy-provider";

type PrivacyModeToggleProps = React.ComponentPropsWithoutRef<"button">;

export const PrivacyModeToggle = ({
  className,
  ...props
}: PrivacyModeToggleProps) => {
  const { privacyMode, toggle } = usePrivacyMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={undefined}
          type="button"
          onClick={toggle}
          aria-pressed={privacyMode}
          aria-label={
            privacyMode
              ? "Desativar modo privacidade"
              : "Ativar modo privacidade"
          }
          title={
            privacyMode
              ? "Desativar modo privacidade"
              : "Ativar modo privacidade"
          }
          data-state={privacyMode ? "active" : "inactive"}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "group relative text-muted-foreground transition-all duration-200",
            "hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40",
            "data-[state=active]:bg-accent/60 data-[state=active]:text-foreground border",
            className
          )}
          {...props}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 data-[state=active]:opacity-100"
          >
            <span className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-blue-500/15 dark:from-blue-500/10 dark:to-blue-500/30" />
          </span>
          {privacyMode ? (
            <RiEyeOffLine
              className="size-4 transition-transform duration-200"
              aria-hidden
            />
          ) : (
            <RiEyeLine
              className="size-4 transition-transform duration-200"
              aria-hidden
            />
          )}
          <span className="sr-only">
            {privacyMode
              ? "Modo privacidade ativo"
              : "Modo privacidade inativo"}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {privacyMode ? "Desativar privacidade" : "Ativar privacidade"}
      </TooltipContent>
    </Tooltip>
  );
};
