import { Button } from "@/components/ui/button";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";

export type CalculatorDisplayProps = {
  history: string | null;
  expression: string;
  resultText: string | null;
  copied: boolean;
  onCopy: () => void;
};

export function CalculatorDisplay({
  history,
  expression,
  resultText,
  copied,
  onCopy,
}: CalculatorDisplayProps) {
  return (
    <div className="rounded-xl border bg-muted px-4 py-5 text-right">
      {history && (
        <div className="text-sm text-muted-foreground">{history}</div>
      )}
      <div className="flex items-center justify-end gap-2">
        <div className="text-right text-3xl font-semibold tracking-tight tabular-nums">
          {expression}
        </div>
        {resultText && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="h-6 w-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <RiCheckLine className="h-4 w-4" />
            ) : (
              <RiFileCopyLine className="h-4 w-4" />
            )}
            <span className="sr-only">
              {copied ? "Resultado copiado" : "Copiar resultado"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
