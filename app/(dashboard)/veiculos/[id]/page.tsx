import { getVehicleById, getContas, getCartoes, getPagadores, getVehicles, getCategories } from "../data";
import { notFound } from "next/navigation";
import { parsePeriodParam, parsePeriod, formatPeriod, formatMonthLabel } from "@/lib/utils/period";
import { VehicleDetailsClient } from "@/components/veiculos/vehicle-details-client";

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

  // Fetch options for dialogs
  const [contas, cartoes, pagadores, vehicles, categories] = await Promise.all([
    getContas(),
    getCartoes(),
    getPagadores(),
    getVehicles(),
    getCategories(),
  ]);

  const contaOptions = contas.map((c: any) => ({ label: c.name, value: c.id }));
  const cartaoOptions = cartoes.map((c: any) => ({ label: c.name, value: c.id }));
  const pagadorOptions = pagadores.map((p: any) => ({ label: p.name, value: p.id }));
  const categoryOptions = categories.map((c: any) => ({ label: c.name, value: c.id }));
  const vehicleOptions = vehicles.map((v: any) => ({ 
    label: v.name, 
    value: v.id,
    lastOdometer: v.abastecimentos[0]?.odometer ?? 0
  }));

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
    <VehicleDetailsClient
      vehicle={vehicle}
      monthlyBreakdown={monthlyBreakdown}
      historyData={historyData}
      efficiencyData={efficiencyData}
      sixMonthRefueling={sixMonthRefueling}
      periodString={periodString}
      vehicleOptions={vehicleOptions}
      contaOptions={contaOptions}
      cartaoOptions={cartaoOptions}
      pagadorOptions={pagadorOptions}
      categoryOptions={categoryOptions}
    />
  );
}
