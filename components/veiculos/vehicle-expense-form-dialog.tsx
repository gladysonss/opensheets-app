"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { createLancamentoAction, updateLancamentoAction } from "@/app/(dashboard)/lancamentos/actions";
import { getTodayDateString } from "@/lib/utils/date";
import type { Option } from "@/types/common";
import {
  ConditionSelectContent,
  ContaCartaoSelectContent,
  PagadorSelectContent,
  PaymentMethodSelectContent,
} from "@/components/lancamentos/select-items";


const expenseFormSchema = z.object({
  veiculoId: z.string().min(1, "Veículo não identificado"),
  date: z.string().min(1, "Informe a data"),
  name: z.string().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  categoriaId: z.string().optional(),
  // Payment fields
  paymentMethod: z.string().min(1, "Informe a forma de pagamento"),
  condition: z.string().min(1, "Informe a condição"),
  installmentCount: z.string().optional(),
  contaId: z.string().optional(),
  cartaoId: z.string().optional(),
  pagadorId: z.string().optional(),
  note: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface VehicleExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
  vehicleName?: string; // Add vehicleName prop
  accountOptions: Option[];
  cardOptions: Option[];
  pagadorOptions: Option[];
  categoryOptions: Option[];
  vehicleOptions?: Option[];
  defaultCategoryId?: string;
  initialData?: ExpenseFormValues & { id: string };
}

export function VehicleExpenseFormDialog({
  open,
  onOpenChange,
  vehicleId,
  vehicleName,
  accountOptions,
  cardOptions,
  pagadorOptions,
  categoryOptions,
  vehicleOptions,
  defaultCategoryId,
  initialData,
}: VehicleExpenseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get vehicle name
  const getVehicleName = (id?: string) => {
    if (vehicleName) return vehicleName;
    if (id && vehicleOptions) {
      return vehicleOptions.find(v => v.value === id)?.label;
    }
    return undefined;
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      veiculoId: initialData?.veiculoId ?? vehicleId ?? (vehicleOptions?.[0]?.value || ""),
      date: initialData?.date ?? getTodayDateString(),
      name: initialData?.name ?? "",
      amount: initialData?.amount ?? 0,
      categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
      paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
      condition: initialData?.condition ?? "À vista",
      installmentCount: initialData?.installmentCount ?? "",
      contaId: initialData?.contaId ?? (accountOptions[0]?.value || ""),
      cartaoId: initialData?.cartaoId ?? "",
      pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
      note: initialData?.note ?? "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const condition = form.watch("condition");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        veiculoId: initialData?.veiculoId ?? vehicleId ?? (vehicleOptions?.[0]?.value || ""),
        date: initialData?.date ?? getTodayDateString(),
        name: initialData?.name ?? "",
        amount: initialData?.amount ?? 0,
        categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
        paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
        condition: initialData?.condition ?? "À vista",
        installmentCount: initialData?.installmentCount ?? "",
        contaId: initialData?.contaId ?? (accountOptions[0]?.value || ""),
        cartaoId: initialData?.cartaoId ?? "",
        pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
        note: initialData?.note ?? "",
      });
    }
  }, [open, vehicleId, accountOptions, pagadorOptions, form, initialData, defaultCategoryId, vehicleOptions, vehicleName]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      let finalName = values.name;
      const currentVehicleId = values.veiculoId || vehicleId;
      
      // Auto-format name for new records: "Outros - [Vehicle] - [Name]"
      if (!initialData && currentVehicleId) {
        const vName = getVehicleName(currentVehicleId);
        if (vName) {
          // Check if it doesn't already start with the pattern to avoid duplication if user typed it manually
          // We check for "Outros - VehicleName" to be safe
          const prefix = `Outros - ${vName} - `;
          
          if (!finalName.startsWith("Outros - ")) {
             finalName = `${prefix}${finalName}`;
          }
        }
      }

      const payload = {
        ...values,
        veiculoId: currentVehicleId, // Ensure veiculoId is set even if field was hidden
        name: finalName,
        purchaseDate: values.date,
        transactionType: "Despesa" as const,
        installmentCount: values.installmentCount ? parseInt(values.installmentCount) : undefined,
      };

      let result;
      if (initialData) {
        result = await updateLancamentoAction({
          ...payload,
          id: initialData.id,
          veiculoId: payload.veiculoId,
          categoriaId: payload.categoriaId || undefined,
          contaId: payload.contaId || undefined,
          cartaoId: payload.cartaoId || undefined,
          pagadorId: payload.pagadorId || undefined,
          note: payload.note || undefined,
        });
      } else {
        result = await createLancamentoAction({
          ...payload,
          veiculoId: payload.veiculoId,
          categoriaId: payload.categoriaId || undefined,
          contaId: payload.contaId || undefined,
          cartaoId: payload.cartaoId || undefined,
          pagadorId: payload.pagadorId || undefined,
          note: payload.note || undefined,
        });
      }

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        if (!initialData) {
          form.reset();
        }
      } else {
        toast.error(result.error || "Erro ao registrar despesa");
      }
    } catch (error) {
      toast.error("Erro inesperado ao registrar despesa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 sm:px-8">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Despesa" : "Nova Despesa do Veículo"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 -mx-6 sm:-mx-8 max-h-[80vh] overflow-y-auto px-6 sm:px-8">
            {/* Vehicle Selection (if not pre-selected via prop) */}
            {(!vehicleId || vehicleId === "") && vehicleOptions && vehicleOptions.length > 0 && (
              <FormField
                control={form.control}
                name="veiculoId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Veículo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(!vehicleId || vehicleId === "") && (!vehicleOptions || vehicleOptions.length === 0) && (
               <div className="text-sm text-red-500 mb-4">
                 Nenhum veículo disponível. Cadastre um veículo primeiro.
               </div>
            )}
            
            <div className="flex w-full flex-col gap-4 sm:flex-row">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/2">
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/2">
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={String(field.value || 0)}
                          onValueChange={field.onChange}
                          placeholder="R$ 0,00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: IPVA 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category - Hidden */}
            <input type="hidden" {...form.register("categoriaId")} />

            <div className="border-t pt-4">
              <div className="space-y-2">
                {/* Payer */}
                <FormField
                  control={form.control}
                  name="pagadorId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Pagador</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione">
                              {field.value &&
                                (() => {
                                  const selectedOption = pagadorOptions.find(
                                    (opt) => opt.value === field.value
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
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione">
                                {field.value && (
                                  <PaymentMethodSelectContent label={field.value} />
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cartão de crédito">
                              <PaymentMethodSelectContent label="Cartão de crédito" />
                            </SelectItem>
                            <SelectItem value="Cartão de débito">
                              <PaymentMethodSelectContent label="Cartão de débito" />
                            </SelectItem>
                            <SelectItem value="Pix">
                              <PaymentMethodSelectContent label="Pix" />
                            </SelectItem>
                            <SelectItem value="Dinheiro">
                              <PaymentMethodSelectContent label="Dinheiro" />
                            </SelectItem>
                            <SelectItem value="Boleto">
                              <PaymentMethodSelectContent label="Boleto" />
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {paymentMethod === "Cartão de crédito" ? (
                    <FormField
                      control={form.control}
                      name="cartaoId"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-1/2">
                          <FormLabel>Cartão</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione">
                                  {field.value &&
                                    (() => {
                                      const selectedOption = cardOptions.find(
                                        (opt) => opt.value === field.value
                                      );
                                      return selectedOption ? (
                                        <ContaCartaoSelectContent
                                          label={selectedOption.label}
                                          logo={selectedOption.logo}
                                          isCartao={true}
                                        />
                                      ) : null;
                                    })()}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cardOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <ContaCartaoSelectContent
                                    label={option.label}
                                    logo={option.logo}
                                    isCartao={true}
                                  />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="contaId"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-1/2">
                          <FormLabel>Conta / Banco</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione">
                                  {field.value &&
                                    (() => {
                                      const selectedOption = accountOptions.find(
                                        (opt) => opt.value === field.value
                                      );
                                      return selectedOption ? (
                                        <ContaCartaoSelectContent
                                          label={selectedOption.label}
                                          logo={selectedOption.logo}
                                          isCartao={false}
                                        />
                                      ) : null;
                                    })()}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accountOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <ContaCartaoSelectContent
                                    label={option.label}
                                    logo={option.logo}
                                    isCartao={false}
                                  />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem className={condition === "Parcelado" ? "w-full sm:w-1/2" : "w-full"}>
                        <FormLabel>Condição</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione">
                                {field.value && (
                                  <ConditionSelectContent label={field.value} />
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="À vista">
                              <ConditionSelectContent label="À vista" />
                            </SelectItem>
                            <SelectItem value="Parcelado">
                              <ConditionSelectContent label="Parcelado" />
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {condition === "Parcelado" && (
                    <FormField
                      control={form.control}
                      name="installmentCount"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-1/2">
                          <FormLabel>Parcelas</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione">
                                  {field.value &&
                                    (() => {
                                      const selectedOption = cardOptions.find(
                                        (opt) => opt.value === field.value
                                      );
                                      return selectedOption ? (
                                        <ContaCartaoSelectContent
                                          label={selectedOption.label}
                                          logo={selectedOption.logo}
                                          isCartao={true}
                                        />
                                      ) : null;
                                    })()}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(24)].map((_, i) => (
                                <SelectItem key={i + 2} value={String(i + 2)}>
                                  {i + 2}x
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Note */}
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Anotação (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Adicione observações sobre o lançamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : initialData ? "Salvar Alterações" : "Salvar Despesa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
