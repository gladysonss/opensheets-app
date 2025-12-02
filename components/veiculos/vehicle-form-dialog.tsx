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
import { createVehicleAction, updateVehicleAction } from "@/app/(dashboard)/veiculos/actions";
import { Plus } from "lucide-react";
import { Veiculo } from "@/db/schema";

const vehicleSchema = z.object({
  name: z.string().min(1, "Informe o nome do veículo."),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido")
    .optional()
    .nullable(),
  plate: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  renavam: z.string().optional().nullable(),
  status: z.enum(["active", "sold", "inactive"]).default("active"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  vehicle?: Veiculo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function VehicleFormDialog({
  vehicle,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: VehicleFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: vehicle?.name ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ?? null,
      plate: vehicle?.plate ?? "",
      color: vehicle?.color ?? "",
      renavam: vehicle?.renavam ?? "",
      status: (vehicle?.status as "active" | "sold" | "inactive") ?? "active",
    },
  });

  function onSubmit(values: VehicleFormValues) {
    startTransition(async () => {
      try {
        const action = vehicle
          ? updateVehicleAction({ ...values, id: vehicle.id })
          : createVehicleAction(values);

        const result = await action;

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          if (!vehicle) form.reset();
        } else {
          toast.error(result.error ?? "Ocorreu um erro ao salvar o veículo.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        !vehicle && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </DialogTrigger>
        )
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {vehicle
              ? "Edite as informações do veículo abaixo."
              : "Preencha as informações para cadastrar um novo veículo."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (Apelido)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Meu Carro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2023"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-1234"
                        {...field}
                        value={field.value ?? ""}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Prata"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="sold">Vendido</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
