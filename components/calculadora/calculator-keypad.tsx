import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/ui";
import { type CalculatorButtonConfig } from "@/hooks/use-calculator-state";

type CalculatorKeypadProps = {
  buttons: CalculatorButtonConfig[][];
};

export function CalculatorKeypad({ buttons }: CalculatorKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {buttons.flat().map((btn, index) => (
        <Button
          key={`${btn.label}-${index}`}
          type="button"
          variant={btn.variant ?? "outline"}
          onClick={btn.onClick}
          className={cn(
            "h-12 text-base font-semibold",
            btn.colSpan === 2 && "col-span-2",
            btn.colSpan === 3 && "col-span-3",
          )}
        >
          {btn.label}
        </Button>
      ))}
    </div>
  );
}
