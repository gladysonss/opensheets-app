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
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { createRefuelingAction } from "@/app/(dashboard)/veiculos/actions";
import { Plus, Fuel } from "lucide-react";
import { uuidSchema } from "@/lib/schemas/common";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const refuelingSchema = z.object({
  veiculoId: uuidSchema("Veículo"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  odometer: z.coerce.number().min(0, "Odômetro inválido"),
  liters: z.coerce.number().positive("Litros deve ser maior que zero"),
  pricePerLiter: z.coerce
    .number()
    .positive("Preço por litro deve ser maior que zero"),
  totalCost: z.coerce.number().positive("Custo total deve ser maior que zero"),
  fuelType: z.string().min(1, "Informe o tipo de combustível"),
  isFullTank: z.boolean().default(true),
  paymentMethod: z.string().min(1, "Informe a forma de pagamento"),
  contaId: uuidSchema("Conta").optional().nullable(),
  cartaoId: uuidSchema("Cartão").optional().nullable(),
  note: z.string().optional().nullable(),
});

type RefuelingFormValues = z.infer<typeof refuelingSchema>;

interface Option {
  label: string;
  value: string;
}

interface RefuelingFormDialogProps {
  veiculoId: string;
  contaOptions: Option[];
  cartaoOptions: Option[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function RefuelingFormDialog({
  veiculoId,
  contaOptions,
  cartaoOptions,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: RefuelingFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const form = useForm<RefuelingFormValues>({
    resolver: zodResolver(refuelingSchema),
    defaultValues: {
      veiculoId,
      date: new Date().toISOString().split("T")[0],
      odometer: 0,
      liters: 0,
      pricePerLiter: 0,
      totalCost: 0,
      fuelType: "Gasolina",
      isFullTank: true,
      paymentMethod: "Cartão de crédito",
      note: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  function onSubmit(values: RefuelingFormValues) {
    startTransition(async () => {
      try {
        const result = await createRefuelingAction(values);

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          form.reset({
            veiculoId,
            date: new Date().toISOString().split("T")[0],
            odometer: values.odometer, // Keep odometer for convenience?
            liters: 0,
            pricePerLiter: values.pricePerLiter, // Keep price for convenience?
            totalCost: 0,
            fuelType: values.fuelType,
            isFullTank: true,
            paymentMethod: values.paymentMethod,
            contaId: values.contaId,
            cartaoId: values.cartaoId,
            note: "",
          });
        } else {
          toast.error(result.error ?? "Ocorreu um erro ao salvar o abastecimento.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado.");
      }
    });
  }

  // Calculate total cost automatically if liters and price are present
  const liters = form.watch("liters");
  const pricePerLiter = form.watch("pricePerLiter");
  
  // Effect to update total cost? No, better to let user input or use a button.
  // Or just simple onChange handlers.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Fuel className="mr-2 h-4 w-4" />
            Novo Abastecimento
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Abastecimento</DialogTitle>
          <DialogDescription>
            Registre o abastecimento para acompanhar o consumo e despesas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
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
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odômetro (Km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litros</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            field.onChange(val);
                            const price = form.getValues("pricePerLiter");
                            if (price > 0) {
                                form.setValue("totalCost", Number((val * price).toFixed(2)));
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
                  <FormItem>
                    <FormLabel>Preço/Litro</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            field.onChange(val);
                            const liters = form.getValues("liters");
                            if (liters > 0) {
                                form.setValue("totalCost", Number((liters * val).toFixed(2)));
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
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combustível</FormLabel>
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Tanque Cheio?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
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
                        <SelectItem value="Cartão de crédito">
                          Cartão de crédito
                        </SelectItem>
                        <SelectItem value="Cartão de débito">
                          Cartão de débito
                        </SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === "Cartão de crédito" && (
                <FormField
                  control={form.control}
                  name="cartaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cartão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cartão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cartaoOptions.map((option) => (
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

              {paymentMethod === "Cartão de débito" && (
                <FormField
                  control={form.control}
                  name="contaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contaOptions.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Posto X, calibragem, etc."
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
