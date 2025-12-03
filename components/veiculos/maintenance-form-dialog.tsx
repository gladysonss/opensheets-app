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
import { DecimalInput } from "@/components/ui/decimal-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { createMaintenanceAction } from "@/app/(dashboard)/veiculos/actions";
import { getTodayDateString } from "@/lib/utils/date";
import type { Option } from "@/types/common";
import { getLastOdometerAction } from "@/app/(dashboard)/veiculos/get-last-odometer";

const maintenanceFormSchema = z.object({
  veiculoId: z.string().min(1, "Selecione um veículo"),
  date: z.string().min(1, "Informe a data"),
  odometer: z.coerce.number().min(0, "Odômetro inválido"),
  type: z.enum(["preventiva", "corretiva", "revisao", "outros"]),
  serviceName: z.string().min(1, "Informe o nome do serviço"),
  description: z.string().optional(),
  parts: z.string().optional(),
  laborCost: z.coerce.number().min(0).optional(),
  partsCost: z.coerce.number().min(0).optional(),
  totalCost: z.coerce.number().positive("Custo total deve ser maior que zero"),
  workshop: z.string().optional(),
  nextMaintenanceKm: z.coerce.number().min(0).optional(),
  nextMaintenanceDate: z.string().optional(),
  // Payment fields
  paymentMethod: z.string().min(1, "Informe a forma de pagamento"),
  condition: z.string().min(1, "Informe a condição"),
  installmentCount: z.string().optional(),
  contaId: z.string().optional(),
  cartaoId: z.string().optional(),
  pagadorId: z.string().optional(),
  categoriaId: z.string().optional(),
  note: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleOptions: Option[];
  accountOptions: Option[];
  cardOptions: Option[];
  pagadorOptions: Option[];
  defaultVehicleId?: string;
  initialData?: MaintenanceFormValues & { id: string };
  defaultCategoryId?: string;
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  vehicleOptions,
  accountOptions,
  cardOptions,
  pagadorOptions,
  defaultVehicleId,
  initialData,
  defaultCategoryId,
}: MaintenanceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOdometer, setLastOdometer] = useState(0);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      veiculoId: initialData?.veiculoId ?? (vehicleOptions[0]?.value || defaultVehicleId || ""),
      date: initialData?.date ?? getTodayDateString(),
      odometer: initialData?.odometer ?? 0,
      type: initialData?.type ?? "preventiva",
      serviceName: initialData?.serviceName ?? "",
      description: initialData?.description ?? "",
      parts: initialData?.parts ?? "",
      laborCost: initialData?.laborCost ?? 0,
      partsCost: initialData?.partsCost ?? 0,
      totalCost: initialData?.totalCost ?? 0,
      workshop: initialData?.workshop ?? "",
      nextMaintenanceKm: initialData?.nextMaintenanceKm ?? undefined,
      nextMaintenanceDate: initialData?.nextMaintenanceDate ?? "",
      paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
      condition: initialData?.condition ?? "À vista",
      installmentCount: initialData?.installmentCount ?? "",
      contaId: initialData?.contaId ?? (accountOptions[0]?.value || ""),
      cartaoId: initialData?.cartaoId ?? "",
      pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
      categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
      note: initialData?.note ?? "",
    },
  });

  const selectedVehicleId = form.watch("veiculoId");
  
  // Fetch last odometer when vehicle changes
  useEffect(() => {
    async function fetchOdometer() {
      if (selectedVehicleId && !initialData) {
        const lastOdometer = await getLastOdometerAction(selectedVehicleId);
        form.setValue("odometer", lastOdometer);
        setLastOdometer(lastOdometer);
      }
    }
    fetchOdometer();
  }, [selectedVehicleId, initialData, form]);

  const paymentMethod = form.watch("paymentMethod");
  const condition = form.watch("condition");

  // Update lastOdometer when selected vehicle changes
  useEffect(() => {
    const selectedVehicle = vehicleOptions.find((v) => v.value === selectedVehicleId);
    if (selectedVehicle) {
      setLastOdometer(selectedVehicle.lastOdometer ?? 0);
    }
  }, [selectedVehicleId, vehicleOptions]);

  // Auto-calculate total cost
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "laborCost" || name === "partsCost") {
        const laborCost = Number(value.laborCost) || 0;
        const partsCost = Number(value.partsCost) || 0;
        const total = laborCost + partsCost;
        form.setValue("totalCost", total);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const selectedVehicle = defaultVehicleId 
        ? vehicleOptions.find(v => v.value === defaultVehicleId) 
        : vehicleOptions[0];

      form.reset({
        veiculoId: initialData?.veiculoId ?? defaultVehicleId ?? (selectedVehicle?.value || ""),
        date: initialData?.date ?? getTodayDateString(),
        odometer: initialData?.odometer ?? 0,
        type: initialData?.type ?? "preventiva",
        serviceName: initialData?.serviceName ?? "",
        description: initialData?.description ?? "",
        parts: initialData?.parts ?? "",
        laborCost: initialData?.laborCost ?? 0,
        partsCost: initialData?.partsCost ?? 0,
        totalCost: initialData?.totalCost ?? 0,
        workshop: initialData?.workshop ?? "",
        nextMaintenanceKm: initialData?.nextMaintenanceKm ?? undefined,
        nextMaintenanceDate: initialData?.nextMaintenanceDate ?? "",
        paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
        condition: initialData?.condition ?? "À vista",
        installmentCount: initialData?.installmentCount ?? "",
        contaId: initialData?.contaId ?? (accountOptions[0]?.value || ""),
        cartaoId: initialData?.cartaoId ?? "",
        pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
        categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
        note: initialData?.note ?? "",
      });
      if (selectedVehicle?.lastOdometer) {
        setLastOdometer(selectedVehicle.lastOdometer);
      }
    }
  }, [open, defaultVehicleId, accountOptions, pagadorOptions, vehicleOptions, form, initialData, defaultCategoryId]);

  const onSubmit = async (values: MaintenanceFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        installmentCount: values.installmentCount ? parseInt(values.installmentCount) : undefined,
      };

      // If odometer is 0 (empty) and we have a last odometer, use that (only for create)
      if (!initialData && payload.odometer === 0 && lastOdometer > 0) {
        payload.odometer = lastOdometer;
      }

      let result;
      if (initialData) {
         const { updateMaintenanceAction } = await import("@/app/(dashboard)/veiculos/actions");
         result = await updateMaintenanceAction({ ...payload, id: initialData.id });
      } else {
         result = await createMaintenanceAction(payload);
      }

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        if (!initialData) {
          form.reset();
        }
      } else {
        toast.error(result.error || "Erro ao registrar manutenção");
      }
    } catch (error) {
      toast.error("Erro inesperado ao registrar manutenção");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 sm:px-8">
        <DialogHeader>
          <DialogTitle>Nova Manutenção</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 -mx-6 max-h-[80vh] overflow-y-auto px-6 pb-1">
            {/* Vehicle Selection */}
            {!defaultVehicleId && (
              <FormField
                control={form.control}
                name="veiculoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

            <div className="flex w-full flex-col gap-2 md:flex-row">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Data *</FormLabel>
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

              {/* Odometer */}
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Odômetro (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={lastOdometer > 0 ? `Último: ${lastOdometer.toLocaleString('pt-BR')} km` : "0"}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Name */}
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Troca de óleo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes do serviço realizado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parts */}
            <FormField
              control={form.control}
              name="parts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peças Trocadas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lista de peças trocadas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full flex-col gap-2 md:flex-row">
              {/* Labor Cost */}
              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Mão de Obra</FormLabel>
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

              {/* Parts Cost */}
              <FormField
                control={form.control}
                name="partsCost"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Peças</FormLabel>
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

              {/* Total Cost */}
              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Total *</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={String(field.value || 0)}
                        onValueChange={field.onChange}
                        placeholder="R$ 0,00"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Próxima Manutenção</h3>
              <div className="flex w-full flex-col gap-2 md:flex-row">
                {/* Next Maintenance Km */}
                <FormField
                  control={form.control}
                  name="nextMaintenanceKm"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>Km</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={lastOdometer > 0 ? `Último: ${lastOdometer.toLocaleString('pt-BR')} km` : "0"}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Next Maintenance Date */}
                <FormField
                  control={form.control}
                  name="nextMaintenanceDate"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Pagamento</h3>
              <div className="space-y-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem className={condition === "Parcelado" ? "w-full sm:w-1/2" : "w-full"}>
                        <FormLabel>Condição *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="À vista">À vista</SelectItem>
                            <SelectItem value="Parcelado">Parcelado</SelectItem>
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
                          <FormLabel>Parcelas *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione" />
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

                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel>Forma de Pagamento *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cartão de crédito">
                              Cartão de crédito
                            </SelectItem>
                            <SelectItem value="Cartão de débito">
                              Débito
                            </SelectItem>
                            <SelectItem value="Pix">Pix</SelectItem>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
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
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cardOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
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
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accountOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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
                </div>

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
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pagadorOptions.map((option) => (
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

                {/* Note */}
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações adicionais" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Category - Hidden */}
            <input type="hidden" {...form.register("categoriaId")} />

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
                {isSubmitting ? "Salvando..." : "Salvar Manutenção"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
