import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  OPERATOR_SYMBOLS,
  formatLocaleValue,
  formatNumber,
  normalizeClipboardNumber,
  performOperation,
  type Operator,
} from "@/lib/utils/calculator";
import { type buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

export type CalculatorButtonConfig = {
  label: string;
  onClick: () => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  colSpan?: number;
};

export function useCalculatorState() {
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [history, setHistory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resetCopiedTimeoutRef = useRef<number | undefined>(undefined);

  const currentValue = useMemo(() => Number(display), [display]);

  const resultText = useMemo(() => {
    if (display === "Erro") {
      return null;
    }

    const normalized = formatNumber(currentValue);
    if (normalized === "Erro") {
      return null;
    }

    return formatLocaleValue(normalized);
  }, [currentValue, display]);

  const reset = useCallback(() => {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setOverwrite(false);
    setHistory(null);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      // Check conditions before state updates
      const shouldReset = overwrite || display === "Erro";

      setDisplay((prev) => {
        if (shouldReset) {
          return digit;
        }

        if (prev === "0") {
          return digit;
        }

        // Limitar a 10 dígitos (excluindo sinal negativo e ponto decimal)
        const digitCount = prev.replace(/[-.]/g, "").length;
        if (digitCount >= 10) {
          return prev;
        }

        return `${prev}${digit}`;
      });

      // Update related states after display update
      if (shouldReset) {
        setOverwrite(false);
        setHistory(null);
      }
    },
    [overwrite, display]
  );

  const inputDecimal = useCallback(() => {
    // Check conditions before state updates
    const shouldReset = overwrite || display === "Erro";

    setDisplay((prev) => {
      if (shouldReset) {
        return "0.";
      }

      if (prev.includes(".")) {
        return prev;
      }

      // Limitar a 10 dígitos antes de adicionar o ponto decimal
      const digitCount = prev.replace(/[-]/g, "").length;
      if (digitCount >= 10) {
        return prev;
      }

      return `${prev}.`;
    });

    // Update related states after display update
    if (shouldReset) {
      setOverwrite(false);
      setHistory(null);
    }
  }, [overwrite, display]);

  const setNextOperator = useCallback(
    (nextOperator: Operator) => {
      if (display === "Erro") {
        reset();
        return;
      }

      const value = currentValue;

      if (accumulator === null || operator === null || overwrite) {
        setAccumulator(value);
      } else {
        const result = performOperation(accumulator, value, operator);
        const formatted = formatNumber(result);
        setAccumulator(Number.isFinite(result) ? result : null);
        setDisplay(formatted);
        if (!Number.isFinite(result)) {
          setOperator(null);
          setOverwrite(true);
          setHistory(null);
          return;
        }
      }

      setOperator(nextOperator);
      setOverwrite(true);
      setHistory(null);
    },
    [accumulator, currentValue, display, operator, overwrite, reset]
  );

  const evaluate = useCallback(() => {
    if (operator === null || accumulator === null || display === "Erro") {
      return;
    }

    const value = currentValue;
    const left = formatNumber(accumulator);
    const right = formatNumber(value);
    const symbol = OPERATOR_SYMBOLS[operator];
    const operation = `${formatLocaleValue(left)} ${symbol} ${formatLocaleValue(
      right
    )}`;
    const result = performOperation(accumulator, value, operator);
    const formatted = formatNumber(result);

    setDisplay(formatted);
    setAccumulator(Number.isFinite(result) ? result : null);
    setOperator(null);
    setOverwrite(true);
    setHistory(operation);
  }, [accumulator, currentValue, display, operator]);

  const toggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === "Erro") {
        return prev;
      }
      if (prev.startsWith("-")) {
        return prev.slice(1);
      }
      return prev === "0" ? prev : `-${prev}`;
    });
    if (overwrite) {
      setOverwrite(false);
      setHistory(null);
    }
  }, [overwrite]);

  const deleteLastDigit = useCallback(() => {
    setHistory(null);

    // Check conditions before state updates
    const isError = display === "Erro";

    setDisplay((prev) => {
      if (prev === "Erro") {
        return "0";
      }

      if (overwrite) {
        return "0";
      }

      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) {
        return "0";
      }

      return prev.slice(0, -1);
    });

    // Update related states after display update
    if (isError) {
      setAccumulator(null);
      setOperator(null);
      setOverwrite(false);
    } else if (overwrite) {
      setOverwrite(false);
    }
  }, [overwrite, display]);

  const applyPercent = useCallback(() => {
    setDisplay((prev) => {
      if (prev === "Erro") {
        return prev;
      }
      const value = Number(prev);
      return formatNumber(value / 100);
    });
    setOverwrite(true);
    setHistory(null);
  }, []);

  const expression = useMemo(() => {
    if (display === "Erro") {
      return "Erro";
    }

    if (operator && accumulator !== null) {
      const symbol = OPERATOR_SYMBOLS[operator];
      const left = formatLocaleValue(formatNumber(accumulator));

      if (overwrite) {
        return `${left} ${symbol}`;
      }

      return `${left} ${symbol} ${formatLocaleValue(display)}`;
    }

    return formatLocaleValue(display);
  }, [accumulator, display, operator, overwrite]);

  const buttons = useMemo(() => {
    const makeOperatorHandler = (nextOperator: Operator) => () =>
      setNextOperator(nextOperator);

    return [
      [
        { label: "C", onClick: reset, variant: "destructive" },
        { label: "⌫", onClick: deleteLastDigit, variant: "default" },
        { label: "%", onClick: applyPercent, variant: "default" },
        {
          label: "÷",
          onClick: makeOperatorHandler("divide"),
          variant: "outline",
        },
      ],
      [
        { label: "7", onClick: () => inputDigit("7") },
        { label: "8", onClick: () => inputDigit("8") },
        { label: "9", onClick: () => inputDigit("9") },
        {
          label: "×",
          onClick: makeOperatorHandler("multiply"),
          variant: "outline",
        },
      ],
      [
        { label: "4", onClick: () => inputDigit("4") },
        { label: "5", onClick: () => inputDigit("5") },
        { label: "6", onClick: () => inputDigit("6") },
        {
          label: "-",
          onClick: makeOperatorHandler("subtract"),
          variant: "outline",
        },
      ],
      [
        { label: "1", onClick: () => inputDigit("1") },
        { label: "2", onClick: () => inputDigit("2") },
        { label: "3", onClick: () => inputDigit("3") },
        { label: "+", onClick: makeOperatorHandler("add"), variant: "outline" },
      ],
      [
        { label: "±", onClick: toggleSign, variant: "default" },
        { label: "0", onClick: () => inputDigit("0") },
        { label: ",", onClick: inputDecimal },
        { label: "=", onClick: evaluate, variant: "default" },
      ],
    ] satisfies CalculatorButtonConfig[][];
  }, [
    applyPercent,
    deleteLastDigit,
    evaluate,
    inputDecimal,
    inputDigit,
    reset,
    setNextOperator,
    toggleSign,
  ]);

  const copyToClipboard = useCallback(async () => {
    if (!resultText) return;

    try {
      await navigator.clipboard.writeText(resultText);

      setCopied(true);
      if (resetCopiedTimeoutRef.current !== undefined) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
      resetCopiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Não foi possível copiar o resultado da calculadora.", error);
    }
  }, [resultText]);

  const pasteFromClipboard = useCallback(async () => {
    if (!navigator.clipboard?.readText) return;

    try {
      const rawValue = await navigator.clipboard.readText();
      const normalized = normalizeClipboardNumber(rawValue);

      if (resetCopiedTimeoutRef.current !== undefined) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
        resetCopiedTimeoutRef.current = undefined;
      }

      setCopied(false);

      if (!normalized) {
        setDisplay("Erro");
        setAccumulator(null);
        setOperator(null);
        setOverwrite(true);
        setHistory(null);
        return;
      }

      // Limitar a 10 dígitos
      const digitCount = normalized.replace(/[-.]/g, "").length;
      if (digitCount > 10) {
        setDisplay("Erro");
        setAccumulator(null);
        setOperator(null);
        setOverwrite(true);
        setHistory(null);
        return;
      }

      setDisplay(normalized);
      setAccumulator(null);
      setOperator(null);
      setOverwrite(false);
      setHistory(null);
    } catch (error) {
      console.error("Não foi possível colar o valor na calculadora.", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resetCopiedTimeoutRef.current !== undefined) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
    };
  }, []);

  return {
    expression,
    history,
    resultText,
    copied,
    buttons,
    copyToClipboard,
    pasteFromClipboard,
  };
}
