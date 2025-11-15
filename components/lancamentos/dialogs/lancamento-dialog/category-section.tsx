"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANCAMENTO_TRANSACTION_TYPES } from "@/lib/lancamentos/constants";
import { cn } from "@/lib/utils/ui";
import {
  CategoriaSelectContent,
  TransactionTypeSelectContent,
} from "../../select-items";
import type { CategorySectionProps } from "./lancamento-dialog-types";

export function CategorySection({
  formState,
  onFieldChange,
  categoriaOptions,
  categoriaGroups,
  isUpdateMode,
}: CategorySectionProps) {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      {!isUpdateMode ? (
        <div className="w-full space-y-1 md:w-1/2">
          <Label htmlFor="transactionType">Tipo de transação</Label>
          <Select
            value={formState.transactionType}
            onValueChange={(value) => onFieldChange("transactionType", value)}
          >
            <SelectTrigger id="transactionType" className="w-full">
              <SelectValue placeholder="Selecione">
                {formState.transactionType && (
                  <TransactionTypeSelectContent
                    label={formState.transactionType}
                  />
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANCAMENTO_TRANSACTION_TYPES.filter(
                (type) => type !== "Transferência"
              ).map((type) => (
                <SelectItem key={type} value={type}>
                  <TransactionTypeSelectContent label={type} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div
        className={cn(
          "space-y-1 w-full",
          !isUpdateMode ? "md:w-1/2" : "md:w-full"
        )}
      >
        <Label htmlFor="categoria">Categoria</Label>
        <Select
          value={formState.categoriaId}
          onValueChange={(value) => onFieldChange("categoriaId", value)}
        >
          <SelectTrigger id="categoria" className="w-full">
            <SelectValue placeholder="Selecione">
              {formState.categoriaId &&
                (() => {
                  const selectedOption = categoriaOptions.find(
                    (opt) => opt.value === formState.categoriaId
                  );
                  return selectedOption ? (
                    <CategoriaSelectContent
                      label={selectedOption.label}
                      icon={selectedOption.icon}
                    />
                  ) : null;
                })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categoriaGroups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <CategoriaSelectContent
                      label={option.label}
                      icon={option.icon}
                    />
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
