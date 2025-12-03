import { getVehicleById } from "../data";
import { notFound } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

import MonthPicker from "@/components/month-picker/month-picker";
import { parsePeriodParam, parsePeriod, formatPeriod, displayPeriod, formatMonthLabel } from "@/lib/utils/period";
import { VehicleReportStats } from "@/components/veiculos/vehicle-report-stats";
import { VehicleMonthlySummaryCard } from "@/components/veiculos/vehicle-monthly-summary-card";
import { VehicleHistoryCard } from "@/components/veiculos/vehicle-history-card";
import { VehicleEfficiencyChart } from "@/components/veiculos/vehicle-efficiency-chart";

export default async function VehicleDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { periodo } = await searchParams;
  
  // Parse selected period (End Month)
  const { period: periodString } = parsePeriodParam(periodo as string);
  const { year, month } = parsePeriod(periodString);
  
  // Calculate date range: [Selected Month - 5 months, Selected Month]
  // Start Date: 1st day of (Month - 5)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of selected month
  const startDate = new Date(year, month - 6, 1); // 1st day of 6 months ago

  // Fetch data for the 6-month window
  const vehicle = await getVehicleById(id, startDate, endDate);

  if (!vehicle) {
    notFound();
  }

  // --- Monthly Summary Calculation (Selected Month) ---
  const currentMonthStart = new Date(year, month - 1, 1);
  const currentMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const monthlyRefueling = vehicle.abastecimentos.filter((a: any) => {
    const date = new Date(a.date);
    return date >= currentMonthStart && date <= currentMonthEnd;
  });
  
  const monthlyExpenses = vehicle.lancamentos.filter((l: any) => {
    const date = new Date(l.purchaseDate);
    return date >= currentMonthStart && date <= currentMonthEnd;
  });

  const monthlyMaintenance = vehicle.manutencoes.filter((m: any) => {
    const date = new Date(m.date);
    return date >= currentMonthStart && date <= currentMonthEnd;
  });

  const monthlyRefuelingTotal = monthlyRefueling.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);
  const monthlyMaintenanceTotal = monthlyMaintenance.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);

  // Collect IDs of lancamentos related to refueling and maintenance to exclude them
  const excludedLancamentoIds = new Set([
    ...monthlyRefueling.map((a: any) => a.lancamentoId).filter(Boolean),
    ...monthlyMaintenance.map((m: any) => m.lancamentoId).filter(Boolean),
  ]);

  const monthlyExpensesTotal = monthlyExpenses
    .filter((l: any) => !excludedLancamentoIds.has(l.id))
    .reduce((acc: number, curr: any) => acc + Math.abs(Number(curr.amount)), 0);

  const monthlyBreakdown = {
    total: monthlyRefuelingTotal + monthlyExpensesTotal + monthlyMaintenanceTotal,
    splits: {
      abastecimento: monthlyRefuelingTotal,
      manutencao: monthlyMaintenanceTotal,
      despesa: monthlyExpensesTotal,
    }
  };



// ... previous imports

  // --- History & Efficiency Calculation (Last 6 Months) ---
  const historyData = [];
  const efficiencyData = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const pString = formatPeriod(d.getFullYear(), d.getMonth() + 1);
    const label = formatMonthLabel(pString).split(" de ")[0].substring(0, 3) + "/" + d.getFullYear().toString().slice(2);
    
    // Filter for this specific month
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const mRefueling = vehicle.abastecimentos
      .filter((a: any) => { const date = new Date(a.date); return date >= mStart && date <= mEnd; });
      
    const mMaintenance = vehicle.manutencoes
      .filter((m: any) => { const date = new Date(m.date); return date >= mStart && date <= mEnd; });

    // Collect IDs to exclude
    const mExcludedIds = new Set([
      ...mRefueling.map((a: any) => a.lancamentoId).filter(Boolean),
      ...mMaintenance.map((m: any) => m.lancamentoId).filter(Boolean),
    ]);

    const mRefuelingTotal = mRefueling.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);
    const mMaintenanceTotal = mMaintenance.reduce((acc: number, curr: any) => acc + Number(curr.totalCost), 0);
      
    const mExpensesTotal = vehicle.lancamentos
      .filter((l: any) => { 
        const date = new Date(l.purchaseDate); 
        return date >= mStart && date <= mEnd && !mExcludedIds.has(l.id); 
      })
      .reduce((acc: number, curr: any) => acc + Math.abs(Number(curr.amount)), 0);

    historyData.push({
      label,
      total: mRefuelingTotal + mExpensesTotal + mMaintenanceTotal,
    });

    // Calculate Efficiency for this month
    // We need to calculate based on distance driven and liters consumed in this month
    // Simple approach: Sum of (odometer - prev_odometer) / Sum of liters
    // But we need 'prev_odometer' for each refueling.
    // The 'abastecimentos' array is sorted by date desc in the DB query, but let's ensure we have context.
    // Actually, efficiency is best calculated per fill-up.
    // Let's take the average of efficiencies recorded in this month?
    // Or calculate total distance / total liters?
    // Total Distance / Total Liters is safer for monthly aggregation.
    
    // We need to find the distance covered by the fuel added in this month? 
    // No, usually it's: I drove X km and used Y liters.
    // In the refueling record, we have 'liters' and 'odometer'.
    // We need the previous odometer to know the distance for *that* fill-up.
    // Since we filtered `mRefueling` for this month, we can calculate efficiency for these specific records.
    // But we need the *previous* record for each of these to calculate distance.
    // `vehicle.abastecimentos` has the full history (sorted desc).
    
    let totalDistance = 0;
    let totalLiters = 0;

    // Sort refueling by odometer descending to ensure correct order for efficiency calculation
    const sortedRefueling = [...vehicle.abastecimentos].sort((a: any, b: any) => b.odometer - a.odometer);

    mRefueling.forEach((refuel: any) => {
       // Find this refuel in the sorted array
       const index = sortedRefueling.findIndex((a: any) => a.id === refuel.id);
       // The array is desc by odometer, so previous refuel (lower odometer) is index + 1
       if (index !== -1 && index < sortedRefueling.length - 1) {
         const prevRefuel = sortedRefueling[index + 1];
         const dist = refuel.odometer - prevRefuel.odometer;
         const liters = Number(refuel.liters);
         
         // Calculate efficiency for this specific interval
         // If it's unreasonably high (e.g. > 150 km/L), it likely means missing data (missed fill-ups between records)
         // We exclude these outliers to prevent skewing the chart
         const intervalEfficiency = liters > 0 ? dist / liters : 0;
         
         if (dist > 0 && liters > 0 && intervalEfficiency < 150) {
           totalDistance += dist;
           totalLiters += liters;
         }
       }
    });

    const efficiency = totalLiters > 0 ? totalDistance / totalLiters : null;
    efficiencyData.push({
      label,
      efficiency,
    });
  }

  // Filter refueling for the entire 6-month window for the stats block
  const sixMonthRefueling = vehicle.abastecimentos.filter((a: any) => {
    const date = new Date(a.date);
    return date >= startDate && date <= endDate;
  });
  
  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
          <p className="text-muted-foreground">
            {vehicle.brand} {vehicle.model}
            {vehicle.plate ? ` - ${vehicle.plate}` : ""}
          </p>
        </div>
        <MonthPicker />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="refueling">Abastecimentos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          
          {/* Top Row: Monthly Summary & History */}
          <div className="grid gap-6 md:grid-cols-2">
            <VehicleMonthlySummaryCard 
              periodLabel={displayPeriod(periodString)}
              breakdown={monthlyBreakdown}
            />
            <VehicleHistoryCard data={historyData} />
          </div>

          {/* Middle Row: Efficiency Chart & Stats */}
          <div className="grid gap-6 md:grid-cols-2">
             <VehicleEfficiencyChart data={efficiencyData} />
             <VehicleReportStats 
              abastecimentos={sixMonthRefueling} 
              periodLabel="Métricas dos últimos 6 meses"
            />
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
                  Nenhum abastecimento registrado neste período.
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
                  Nenhuma despesa registrada neste período.
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
