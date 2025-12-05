"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createRefuelingAction } from "@/app/(dashboard)/veiculos/actions";
import { Plus, Fuel } from "lucide-react";
import { uuidSchema } from "@/lib/schemas/common";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { getTodayDateString } from "@/lib/utils/date";
import { getLastOdometerAction } from "@/app/(dashboard)/veiculos/get-last-odometer";
import {
  ConditionSelectContent,
  ContaCartaoSelectContent,
  PagadorSelectContent,
  PaymentMethodSelectContent,
} from "@/components/lancamentos/select-items";

const refuelingSchema = z.object({
  veiculoId: uuidSchema("Veículo"),
  date: z.string().min(1, "Informe a data"),
  odometer: z.coerce.number().min(0, "Odômetro inválido"),
  liters: z.coerce.number().positive("Litros deve ser maior que zero"),
  pricePerLiter: z.coerce.number().min(0, "Preço inválido"),
  totalCost: z.coerce.number().min(0, "Total inválido"),
  fuelType: z.string().min(1, "Selecione o combustível"),
  isFullTank: z.boolean().default(true),
  paymentMethod: z.string().min(1, "Selecione a forma de pagamento"),
  condition: z.string().min(1, "Selecione a condição"),
  installmentCount: z.string().optional(),
  contaId: z.string().optional(),
  cartaoId: z.string().optional(),
  pagadorId: uuidSchema("Pagador").optional().nullable(),
  categoriaId: z.string().optional(),
  note: z.string().optional().nullable(),
});

type RefuelingFormValues = z.infer<typeof refuelingSchema>;

interface Option {
  label: string;
  value: string;
}

interface RefuelingFormDialogProps {
  veiculoId?: string;
  vehicleOptions?: Option[];
  contaOptions: Option[];
  cartaoOptions: Option[];
  pagadorOptions: Option[];
  lastOdometer?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: RefuelingFormValues & { id: string };
  defaultCategoryId?: string;
}

export function RefuelingFormDialog({
  veiculoId,
  vehicleOptions = [],
  contaOptions,
  cartaoOptions,
  pagadorOptions,
  lastOdometer = 0,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  initialData,
  defaultCategoryId,
}: RefuelingFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const totalInputMode = useRef<"update_price" | "update_liters" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLastOdometer, setCurrentLastOdometer] = useState(lastOdometer);


  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const form = useForm<RefuelingFormValues>({
    resolver: zodResolver(refuelingSchema),
    defaultValues: {
      veiculoId: initialData?.veiculoId ?? veiculoId ?? (vehicleOptions.length > 0 ? vehicleOptions[0].value : ""),
      date: initialData?.date ?? getTodayDateString(),
      odometer: initialData?.odometer ?? 0,
      liters: initialData?.liters ?? 0,
      pricePerLiter: initialData?.pricePerLiter ?? 0,
      totalCost: initialData?.totalCost ?? 0,
      fuelType: initialData?.fuelType ?? "Gasolina",
      isFullTank: initialData?.isFullTank ?? true,
      paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
      condition: initialData?.condition ?? "À vista",
      installmentCount: initialData?.installmentCount ?? "",
      contaId: initialData?.contaId ?? (contaOptions[0]?.value || ""),
      cartaoId: initialData?.cartaoId ?? "",
      pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
      categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
      note: initialData?.note ?? "",
    },
  });

  // Reset form when initialData changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        veiculoId: initialData?.veiculoId ?? veiculoId ?? (vehicleOptions.length > 0 ? vehicleOptions[0].value : ""),
        date: initialData?.date ?? getTodayDateString(),
        odometer: initialData?.odometer ?? 0,
        liters: initialData?.liters ?? 0,
        pricePerLiter: initialData?.pricePerLiter ?? 0,
        totalCost: initialData?.totalCost ?? 0,
        fuelType: initialData?.fuelType ?? "Gasolina",
        isFullTank: initialData?.isFullTank ?? true,
        paymentMethod: initialData?.paymentMethod ?? "Cartão de crédito",
        condition: initialData?.condition ?? "À vista",
        installmentCount: initialData?.installmentCount ?? "",
        contaId: initialData?.contaId ?? (contaOptions[0]?.value || ""),
        cartaoId: initialData?.cartaoId ?? "",
        pagadorId: initialData?.pagadorId ?? (pagadorOptions[0]?.value || ""),
        categoriaId: initialData?.categoriaId ?? defaultCategoryId ?? "",
        note: initialData?.note ?? "",
      });
    }
  }, [open, initialData, veiculoId, vehicleOptions, contaOptions, pagadorOptions, form, defaultCategoryId]);

  const selectedVehicleId = form.watch("veiculoId");

  // Fetch last odometer when vehicle changes
  useEffect(() => {
    async function fetchOdometer() {
      if (selectedVehicleId && !initialData) {
        const lastOdometer = await getLastOdometerAction(selectedVehicleId);
        form.setValue("odometer", lastOdometer);
        setCurrentLastOdometer(lastOdometer);
      }
    }
    fetchOdometer();
  }, [selectedVehicleId, initialData, form]);

  const paymentMethod = form.watch("paymentMethod");
  const condition = form.watch("condition");


  function onSubmit(values: RefuelingFormValues) {
    const payload = {
      ...values,
      installmentCount: values.installmentCount ? parseInt(values.installmentCount) : undefined,
    };
    
    // If odometer is 0 (empty) and we have a last odometer, use that (only for create)
    if (!initialData && payload.odometer === 0 && lastOdometer > 0) {
      payload.odometer = lastOdometer;
    }

    startTransition(async () => {
      try {
        let result;
        
        if (initialData) {
           // Import dynamically to avoid circular dependencies if any, or just use the action
           const { updateRefuelingAction } = await import("@/app/(dashboard)/veiculos/actions");
           result = await updateRefuelingAction({ ...payload, id: initialData.id });
        } else {
           result = await createRefuelingAction(payload);
        }

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          if (!initialData) {
            form.reset();
          }
        } else {
          toast.error(result.error ?? "Ocorreu um erro ao salvar o abastecimento.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="sm:max-w-xl p-6 sm:px-8">
        <DialogHeader>
          <DialogTitle>Novo Abastecimento</DialogTitle>
          <DialogDescription>
            Registre o abastecimento para acompanhar o consumo e despesas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 -mx-6 max-h-[80vh] overflow-y-auto px-6 pb-1">
            {!veiculoId && vehicleOptions.length > 0 && (
              <FormField
                control={form.control}
                name="veiculoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo</FormLabel>
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
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
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Odômetro (Km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={currentLastOdometer > 0 ? `Último: ${currentLastOdometer} km` : "0"}
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Litros</FormLabel>
                    <FormControl>
                      <DecimalInput
                        value={field.value ?? 0}
                        onValueChange={(val) => {
                          const numVal = Number(val);
                          field.onChange(numVal);
                          const price = form.getValues("pricePerLiter");
                          const total = form.getValues("totalCost");
                          
                          if (price > 0) {
                            form.setValue(
                              "totalCost",
                              Number((numVal * price).toFixed(2))
                            );
                          } else if (total > 0 && numVal > 0) {
                            form.setValue(
                              "pricePerLiter",
                              Number((total / numVal).toFixed(3))
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerLiter"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Preço/Litro</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={String(field.value)}
                        onValueChange={(val) => {
                          const numVal = Number(val);
                          field.onChange(numVal);
                          const liters = form.getValues("liters");
                          const total = form.getValues("totalCost");

                          if (liters > 0) {
                            form.setValue(
                              "totalCost",
                              Number((liters * numVal).toFixed(2))
                            );
                          } else if (total > 0 && numVal > 0) {
                            form.setValue(
                              "liters",
                              Number((total / numVal).toFixed(3))
                            );
                          }
                        }}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Total (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={String(field.value)}
                        onFocus={() => {
                          const price = form.getValues("pricePerLiter");
                          const liters = form.getValues("liters");
                          if (liters > 0 && price === 0) {
                            totalInputMode.current = "update_price";
                          } else {
                            totalInputMode.current = "update_liters";
                          }
                        }}
                        onValueChange={(val) => {
                          const numVal = Number(val);
                          field.onChange(numVal);
                          
                          if (totalInputMode.current === "update_price") {
                             const liters = form.getValues("liters");
                             if (liters > 0) {
                               form.setValue("pricePerLiter", Number((numVal / liters).toFixed(3)));
                             }
                          } else {
                             const price = form.getValues("pricePerLiter");
                             if (price > 0) {
                               form.setValue("liters", Number((numVal / price).toFixed(3)));
                             }
                          }
                        }}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Combustível</FormLabel>
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
                        <SelectItem value="Gasolina">Gasolina</SelectItem>
                        <SelectItem value="Etanol">Etanol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="GNV">GNV</SelectItem>
                        <SelectItem value="Elétrico">Elétrico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFullTank"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Opções</FormLabel>
                    <FormControl>
                      <div className="flex h-9 w-full items-center space-x-2 rounded-md border border-input bg-transparent px-3 py-1 shadow-sm">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm font-medium leading-none">
                          Tanque Cheio?
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pagadorId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Pagador</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o pagador">
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
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o cartão">
                              {field.value &&
                                (() => {
                                  const selectedOption = cartaoOptions.find(
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
                          {cartaoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a conta">
                              {field.value &&
                                (() => {
                                  const selectedOption = contaOptions.find(
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
                          {contaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotação (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre o lançamento"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category - Hidden */}
            <input type="hidden" {...form.register("categoriaId")} />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
