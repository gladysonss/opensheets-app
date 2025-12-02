"use client";

import * as React from "react";

import { cn } from "@/lib/utils/ui";
import { Input } from "./input";

const DECIMAL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const digitsToDecimalString = (digits: string) => {
  const sanitized = digits.replace(/\D/g, "");
  if (sanitized.length === 0) {
    return "";
  }

  const padded = sanitized.padStart(4, "0");
  const integerPart = padded.slice(0, -3).replace(/^0+(?=\d)/, "") || "0";
  const fractionPart = padded.slice(-3);

  return `${integerPart}.${fractionPart}`;
};

const decimalToDigits = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const normalized = value.toString().replace(/\s/g, "").replace(",", ".");
  const numeric = Number(normalized);

  if (Number.isNaN(numeric)) {
    return "";
  }

  const cents = Math.round(Math.abs(numeric) * 1000);
  return cents === 0 ? "0" : cents.toString();
};

const formatDigits = (digits: string) => {
  if (digits.length === 0) {
    return "";
  }

  const decimal = digitsToDecimalString(digits);
  const numeric = Number(decimal);

  if (Number.isNaN(numeric)) {
    return "";
  }

  return DECIMAL_FORMATTER.format(numeric);
};

export interface DecimalInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "defaultValue" | "type" | "inputMode" | "onChange"
  > {
  value: string | number;
  onValueChange: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const DecimalInput = React.forwardRef<
  HTMLInputElement,
  DecimalInputProps
>(({ className, value, onValueChange, onBlur, onChange, ...props }, ref) => {
  const digits = React.useMemo(() => decimalToDigits(value), [value]);
  const displayValue = React.useMemo(() => formatDigits(digits), [digits]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const nextDigits = rawValue.replace(/\D/g, "");

    if (nextDigits.length === 0) {
      onValueChange("");
    } else {
      onValueChange(digitsToDecimalString(nextDigits));
    }

    onChange?.(event);
  };

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={cn(
        "text-left font-medium tabular-nums tracking-tight",
        className
      )}
    />
  );
});

DecimalInput.displayName = "DecimalInput";
