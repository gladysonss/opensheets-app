import { getVehicleById } from "../data";
import { notFound } from "next/navigation";
import { RefuelingFormDialog } from "@/components/veiculos/refueling-form-dialog";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { contas, cartoes } from "@/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

export default async function VehicleDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const vehicle = await getVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  const user = await getUser();
  const userContas = await db.query.contas.findMany({
    where: eq(contas.userId, user.id),
  });
  const userCartoes = await db.query.cartoes.findMany({
    where: eq(cartoes.userId, user.id),
  });

  const contaOptions = userContas.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));
  const cartaoOptions = userCartoes.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));

  const totalRefuelingCost = vehicle.abastecimentos.reduce(
    (acc: number, curr: any) => acc + Number(curr.totalCost),
    0
  );
  const totalExpenses = vehicle.lancamentos.reduce(
    (acc: number, curr: any) => acc + Math.abs(Number(curr.amount)),
    0
  );

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
          <p className="text-muted-foreground">
            {vehicle.brand} {vehicle.model}
            {vehicle.plate ? ` - ${vehicle.plate}` : ""}
          </p>
        </div>
        <RefuelingFormDialog
          veiculoId={vehicle.id}
          contaOptions={contaOptions}
          cartaoOptions={cartaoOptions}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="refueling">Abastecimentos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total em Abastecimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRefuelingCost)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total em Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inclui abastecimentos e outras despesas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Último Odômetro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vehicle.abastecimentos[0]?.odometer ?? 0} km
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="refueling">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.abastecimentos.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum abastecimento registrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {vehicle.abastecimentos.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{formatDate(a.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.liters}L • {a.fuelType}
                          {a.isFullTank && " • Tanque Cheio"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(Number(a.totalCost))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.odometer} km
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.lancamentos.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhuma despesa registrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {vehicle.lancamentos.map((l: any) => (
                    <div
                      key={l.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(l.purchaseDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-500">
                          {formatCurrency(Number(l.amount))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {l.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
