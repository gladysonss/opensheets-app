import { getVehicles } from "./data";
import { VehicleFormDialog } from "@/components/veiculos/vehicle-form-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, Settings } from "lucide-react";
import { type Veiculo } from "@/db/schema";

export default async function VeiculosPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie seus veículos e acompanhe abastecimentos e despesas.
          </p>
        </div>
        <VehicleFormDialog />
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <Car className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum veículo cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Cadastre seu primeiro veículo para começar a acompanhar.
          </p>
          <VehicleFormDialog />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
