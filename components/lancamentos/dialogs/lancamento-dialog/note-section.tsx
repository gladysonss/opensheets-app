"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NoteSectionProps } from "./lancamento-dialog-types";

export function NoteSection({ formState, onFieldChange }: NoteSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="note">Anotação</Label>
      <Textarea
        id="note"
        value={formState.note}
        onChange={(event) => onFieldChange("note", event.target.value)}
        placeholder="Adicione observações sobre o lançamento"
        rows={2}
      />
    </div>
  );
}
