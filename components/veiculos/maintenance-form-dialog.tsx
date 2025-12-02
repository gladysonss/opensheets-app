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
import { createMaintenanceAction } from "@/app/(dashboard)/veiculos/actions";
import type { Option } from "@/types/common";

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
  contaId: z.string().optional(),
  cartaoId: z.string().optional(),
  pagadorId: z.string().optional(),
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
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  vehicleOptions,
  accountOptions,
  cardOptions,
  pagadorOptions,
  defaultVehicleId,
}: MaintenanceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      veiculoId: defaultVehicleId || "",
      date: new Date().toISOString().split("T")[0],
      odometer: 0,
      type: "preventiva",
      serviceName: "",
      description: "",
      parts: "",
      laborCost: 0,
      partsCost: 0,
      totalCost: 0,
      workshop: "",
      nextMaintenanceKm: undefined,
      nextMaintenanceDate: "",
      paymentMethod: "Dinheiro",
      contaId: accountOptions[0]?.value || "",
      cartaoId: "",
      pagadorId: pagadorOptions[0]?.value || "",
      note: "",
    },
  });

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
      form.reset({
        veiculoId: defaultVehicleId || "",
        date: new Date().toISOString().split("T")[0],
        odometer: 0,
        type: "preventiva",
        serviceName: "",
        description: "",
        parts: "",
        laborCost: 0,
        partsCost: 0,
        totalCost: 0,
        workshop: "",
        nextMaintenanceKm: undefined,
        nextMaintenanceDate: "",
        paymentMethod: "Dinheiro",
        contaId: accountOptions[0]?.value || "",
        cartaoId: "",
        pagadorId: pagadorOptions[0]?.value || "",
        note: "",
      });
    }
  }, [open, defaultVehicleId, accountOptions, pagadorOptions, form]);

  const onSubmit = async (values: MaintenanceFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createMaintenanceAction(values);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        form.reset();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Manutenção</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Vehicle Selection */}
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
                      <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                  <FormItem>
                    <FormLabel>Odômetro (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
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

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                        <SelectItem value="revisao">Revisão</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            {/* Workshop */}
            <FormField
              control={form.control}
              name="workshop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oficina</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da oficina" {...field} />
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

            <div className="grid grid-cols-3 gap-4">
              {/* Labor Cost */}
              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mão de Obra</FormLabel>
                    <FormControl>
                      <DecimalInput
                        value={field.value || 0}
                        onValueChange={field.onChange}
                        placeholder="0,00"
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
                  <FormItem>
                    <FormLabel>Peças</FormLabel>
                    <FormControl>
                      <DecimalInput
                        value={field.value || 0}
                        onValueChange={field.onChange}
                        placeholder="0,00"
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
                  <FormItem>
                    <FormLabel>Total *</FormLabel>
                    <FormControl>
                      <DecimalInput
                        value={field.value || 0}
                        onValueChange={field.onChange}
                        placeholder="0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Próxima Manutenção</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Next Maintenance Km */}
                <FormField
                  control={form.control}
                  name="nextMaintenanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Km</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Débito">Débito</SelectItem>
                          <SelectItem value="Crédito">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Account */}
                  <FormField
                    control={form.control}
                    name="contaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conta</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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

                  {/* Card */}
                  <FormField
                    control={form.control}
                    name="cartaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cartão</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                </div>

                {/* Payer */}
                <FormField
                  control={form.control}
                  name="pagadorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pagador</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                    <FormItem>
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
