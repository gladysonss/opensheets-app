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
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
} from "@/app/(dashboard)/veiculos/actions";
import {
  Plus,
  Car,
  Bike,
  Truck,
  Bus,
  MoreHorizontal,
  Check,
  Trash2,
} from "lucide-react";
import { Veiculo } from "@/db/schema";
import { cn } from "@/lib/utils/ui";

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
  type: z
    .enum(["car", "motorcycle", "truck", "bus", "other"])
    .default("car"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  vehicle?: Veiculo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const VEHICLE_TYPES = [
  { value: "car", label: "Carro", icon: Car },
  { value: "motorcycle", label: "Moto", icon: Bike },
  { value: "truck", label: "Caminhão", icon: Truck },
  { value: "bus", label: "Ônibus", icon: Bus },
  { value: "other", label: "Outro", icon: MoreHorizontal },
] as const;

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
      type: (vehicle?.type as "car" | "motorcycle" | "truck" | "bus" | "other") ?? "car",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: vehicle?.name ?? "",
        brand: vehicle?.brand ?? "",
        model: vehicle?.model ?? "",
        year: vehicle?.year ?? null,
        plate: vehicle?.plate ?? "",
        color: vehicle?.color ?? "",
        renavam: vehicle?.renavam ?? "",
        status: (vehicle?.status as "active" | "sold" | "inactive") ?? "active",
        type: (vehicle?.type as "car" | "motorcycle" | "truck" | "bus" | "other") ?? "car",
      });
    }
  }, [open, vehicle, form]);

  function onSubmit(values: VehicleFormValues) {
    startTransition(async () => {
      try {
        // Note: 'type' is currently ignored by the server action as it's not in the DB schema yet.
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
      <DialogContent className="max-w-2xl px-6 py-5 sm:px-8 sm:py-6">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
          <DialogDescription>
            {vehicle
              ? "Edite as informações do veículo abaixo."
              : "Preencha as informações para cadastrar um novo veículo."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3">
              {/* Row 1: Name and Status */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nome (Apelido)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Meu Carro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:w-[180px]">
                      <FormLabel>Status</FormLabel>
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

              {/* Row 2: Brand and Model */}
              <div className="grid grid-cols-2 gap-3">
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

              {/* Row 3: Year, Plate, Color */}
              <div className="grid grid-cols-3 gap-3">
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
                            const val =
                              e.target.value === ""
                                ? null
                                : Number(e.target.value);
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
              </div>

              {/* Vehicle Type Selection */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Veículo</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-5 gap-3">
                        {VEHICLE_TYPES.map((type) => {
                          const isSelected = field.value === type.value;
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => field.onChange(type.value)}
                              className={cn(
                                "group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-border/70 p-3 transition-all hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "bg-background text-muted-foreground hover:bg-muted/50"
                              )}
                            >
                              {isSelected && (
                                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                  <Check className="size-3" />
                                </span>
                              )}
                              <Icon className="size-6" />
                              <span className="text-xs font-medium">
                                {type.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 sm:justify-between">
              {vehicle ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        const result = await deleteVehicleAction({
                          id: vehicle.id,
                        });
                        if (result.success) {
                          toast.success(result.message);
                          setOpen(false);
                        } else {
                          toast.error(
                            result.error ??
                              "Ocorreu um erro ao excluir o veículo."
                          );
                        }
                      } catch (error) {
                        toast.error("Ocorreu um erro inesperado.");
                      }
                    });
                  }}
                  disabled={isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              ) : (
                <div /> // Spacer for layout consistency if needed
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar Veículo"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
