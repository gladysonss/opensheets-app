"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useMemo, useState } from "react";
import { SelectOption } from "../types";
import { CategoriaSelectContent } from "../select-items";

interface BulkEditMultipleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  transactionType?: string;
  onConfirm: (data: BulkEditMultipleData) => Promise<void>;
  pagadorOptions: SelectOption[];
  contaOptions: SelectOption[];
  cartaoOptions: SelectOption[];
  categoriaOptions: SelectOption[];
}

export interface BulkEditMultipleData {
  categoriaId?: string;
  pagadorId?: string;
  contaId?: string;
  cartaoId?: string;
}

export function BulkEditMultipleDialog({
  open,
  onOpenChange,
  count,
  transactionType,
  onConfirm,
  pagadorOptions,
  contaOptions,
  cartaoOptions,
  categoriaOptions,
}: BulkEditMultipleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    categoria: false,
    pagador: false,
    contaCartao: false,
  });

  const [formData, setFormData] = useState<{
    categoriaId: string;
    pagadorId: string;
    contaId: string;
    cartaoId: string;
    paymentMethodType: "conta" | "cartao";
  }>({
    categoriaId: "",
    pagadorId: "",
    contaId: "",
    cartaoId: "",
    paymentMethodType: "conta",
  });

  const filteredCategoriaOptions = useMemo(() => {
    if (!transactionType) return categoriaOptions;
    return categoriaOptions.filter(
      (option) =>
        !option.group ||
        option.group.toLowerCase() === transactionType.toLowerCase()
    );
  }, [categoriaOptions, transactionType]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data: BulkEditMultipleData = {};

      if (selectedFields.categoria) {
        data.categoriaId = formData.categoriaId;
      }

      if (selectedFields.pagador) {
        data.pagadorId = formData.pagadorId === "none" ? undefined : formData.pagadorId;
      }

      if (selectedFields.contaCartao) {
        if (formData.paymentMethodType === "conta") {
          data.contaId = formData.contaId;
          data.cartaoId = undefined;
        } else {
          data.cartaoId = formData.cartaoId;
          data.contaId = undefined;
        }
      }

      await onConfirm(data);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasSelection =
    selectedFields.categoria ||
    selectedFields.pagador ||
    selectedFields.contaCartao;

  const isValid =
    (!selectedFields.categoria || formData.categoriaId) &&
    (!selectedFields.pagador || formData.pagadorId) &&
    (!selectedFields.contaCartao ||
      (formData.paymentMethodType === "conta"
        ? formData.contaId
        : formData.cartaoId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar {count} lançamentos</DialogTitle>
          <DialogDescription>
            Selecione os campos que deseja alterar em todos os itens selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Categoria */}
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check-categoria"
                checked={selectedFields.categoria}
                onCheckedChange={(checked) =>
                  setSelectedFields((prev) => ({
                    ...prev,
                    categoria: !!checked,
                  }))
                }
              />
              <Label htmlFor="check-categoria" className="font-semibold">
                Alterar Categoria
              </Label>
            </div>
            {selectedFields.categoria && (
              <div className="pl-6">
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoriaId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategoriaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <CategoriaSelectContent
                          label={option.label}
                          icon={option.icon}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Pagador */}
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check-pagador"
                checked={selectedFields.pagador}
                onCheckedChange={(checked) =>
                  setSelectedFields((prev) => ({ ...prev, pagador: !!checked }))
                }
              />
              <Label htmlFor="check-pagador" className="font-semibold">
                Alterar Pagador
              </Label>
            </div>
            {selectedFields.pagador && (
              <div className="pl-6">
                <Select
                  value={formData.pagadorId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, pagadorId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pagador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem pagador</SelectItem>
                    {pagadorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Conta / Cartão */}
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="check-conta"
                checked={selectedFields.contaCartao}
                onCheckedChange={(checked) =>
                  setSelectedFields((prev) => ({
                    ...prev,
                    contaCartao: !!checked,
                  }))
                }
              />
              <Label htmlFor="check-conta" className="font-semibold">
                Alterar Conta / Cartão
              </Label>
            </div>
            {selectedFields.contaCartao && (
              <div className="pl-6 grid gap-3">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="type-conta"
                      name="payment-type"
                      checked={formData.paymentMethodType === "conta"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethodType: "conta",
                        }))
                      }
                      className="accent-primary"
                    />
                    <Label htmlFor="type-conta">Conta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="type-cartao"
                      name="payment-type"
                      checked={formData.paymentMethodType === "cartao"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethodType: "cartao",
                        }))
                      }
                      className="accent-primary"
                    />
                    <Label htmlFor="type-cartao">Cartão de Crédito</Label>
                  </div>
                </div>

                {formData.paymentMethodType === "conta" ? (
                  <Select
                    value={formData.contaId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, contaId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {contaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={formData.cartaoId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, cartaoId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {cartaoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasSelection || !isValid || loading}
          >
            {loading && <Spinner className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
