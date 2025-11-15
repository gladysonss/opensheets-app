"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PagadorSelectContent } from "../../select-items";
import type { PagadorSectionProps } from "./lancamento-dialog-types";

export function PagadorSection({
  formState,
  onFieldChange,
  pagadorOptions,
  secondaryPagadorOptions,
}: PagadorSectionProps) {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <div className="w-full space-y-1">
        <Label htmlFor="pagador">Pagador</Label>
        <Select
          value={formState.pagadorId}
          onValueChange={(value) => onFieldChange("pagadorId", value)}
        >
          <SelectTrigger id="pagador" className="w-full">
            <SelectValue placeholder="Selecione">
              {formState.pagadorId &&
                (() => {
                  const selectedOption = pagadorOptions.find(
                    (opt) => opt.value === formState.pagadorId
                  );
                  return selectedOption ? (
                    <PagadorSelectContent
                      label={selectedOption.label}
                      avatarUrl={selectedOption.avatarUrl}
                    />
                  ) : null;
                })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pagadorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <PagadorSelectContent
                  label={option.label}
                  avatarUrl={option.avatarUrl}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formState.isSplit ? (
        <div className="w-full space-y-1">
          <Label htmlFor="secondaryPagador">Dividir com</Label>
          <Select
            value={formState.secondaryPagadorId}
            onValueChange={(value) =>
              onFieldChange("secondaryPagadorId", value)
            }
          >
            <SelectTrigger
              id="secondaryPagador"
              disabled={secondaryPagadorOptions.length === 0}
              className={"w-full"}
            >
              <SelectValue placeholder="Selecione">
                {formState.secondaryPagadorId &&
                  (() => {
                    const selectedOption = secondaryPagadorOptions.find(
                      (opt) => opt.value === formState.secondaryPagadorId
                    );
                    return selectedOption ? (
                      <PagadorSelectContent
                        label={selectedOption.label}
                        avatarUrl={selectedOption.avatarUrl}
                      />
                    ) : null;
                  })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {secondaryPagadorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <PagadorSelectContent
                    label={option.label}
                    avatarUrl={option.avatarUrl}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
