import { getVehicles } from "./data";
import { VehicleFormDialog } from "@/components/veiculos/vehicle-form-dialog";
import { RefuelingFormDialog } from "@/components/veiculos/refueling-form-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, Settings, Plus, Fuel } from "lucide-react";
import { type Veiculo } from "@/db/schema";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { contas, cartoes } from "@/db/schema";

export default async function VeiculosPage() {
  const user = await getUser();
  const [vehicles, userContas, userCartoes] = await Promise.all([
    getVehicles(),
    db.query.contas.findMany({
      where: eq(contas.userId, user.id),
    }),
    db.query.cartoes.findMany({
      where: eq(cartoes.userId, user.id),
    }),
  ]);

  const contaOptions = userContas.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));
  const cartaoOptions = userCartoes.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));
  const vehicleOptions = vehicles.map((v) => ({
    label: v.name,
    value: v.id,
  }));

  return (
    <div className="flex flex-col gap-6 w-full px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Veículos</h1>
        <p className="text-muted-foreground">
          Gerencie seus veículos e acompanhe abastecimentos e despesas.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VehicleFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo veículo
            </Button>
          }
        />
        <RefuelingFormDialog
          vehicleOptions={vehicleOptions}
          contaOptions={contaOptions}
          cartaoOptions={cartaoOptions}
          trigger={
            <Button variant="secondary">
              <Fuel className="mr-2 h-4 w-4" />
              Novo Abastecimento
            </Button>
          }
        />
      </div>

      {vehicles.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="flex flex-col items-center text-center max-w-sm text-sm text-muted-foreground">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Nenhum veículo cadastrado
            </h3>
            <p className="mb-4">
              Cadastre seu primeiro veículo para começar a acompanhar.
            </p>
            <VehicleFormDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {vehicles.map((vehicle: Veiculo) => (
            <Card key={vehicle.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {vehicle.name}
                </CardTitle>
                <Car className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                    {vehicle.status === "active"
                      ? "Ativo"
                      : vehicle.status === "sold"
                      ? "Vendido"
                      : "Inativo"}
                  </span>
                  {vehicle.plate && (
                    <span className="font-mono">{vehicle.plate}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/veiculos/${vehicle.id}`}>Detalhes</Link>
                </Button>
                <VehicleFormDialog
                  vehicle={vehicle}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
