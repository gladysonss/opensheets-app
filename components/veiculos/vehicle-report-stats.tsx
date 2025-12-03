"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { Abastecimento } from "@/db/schema";
import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface VehicleReportStatsProps {
  abastecimentos: Abastecimento[];
  periodLabel: string;
}

export function VehicleReportStats({
  abastecimentos,
  periodLabel,
}: VehicleReportStatsProps) {
  const stats = useMemo(() => {
    if (abastecimentos.length === 0) return null;

    // Sort by date/odometer ascending
    const sorted = [...abastecimentos].sort((a, b) => {
      if (a.date === b.date) return a.odometer - b.odometer;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const totalCost = sorted.reduce((acc, curr) => acc + Number(curr.totalCost), 0);
    const totalLiters = sorted.reduce((acc, curr) => acc + Number(curr.liters), 0);

    // Calculate efficiency
    let efficiencies: number[] = [];
    let pricePerKm: number[] = [];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = sorted[i - 1];
      const distance = current.odometer - previous.odometer;
      const liters = Number(current.liters);
      const cost = Number(current.totalCost);

      if (distance > 0 && liters > 0) {
        const eff = distance / liters;
        // Filter out outliers (e.g. missing data causing huge distance)
        if (eff < 150) {
          efficiencies.push(eff);
        }
      }
      if (distance > 0 && cost > 0) {
        pricePerKm.push(cost / distance);
      }
    }

    const lastEfficiency = efficiencies.length > 0 ? efficiencies[efficiencies.length - 1] : 0;
    const bestEfficiency = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
    const worstEfficiency = efficiencies.length > 0 ? Math.min(...efficiencies) : 0;
    const avgEfficiency = efficiencies.length > 0 
      ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length 
      : 0;

    const lastPricePerKm = pricePerKm.length > 0 ? pricePerKm[pricePerKm.length - 1] : 0;
    const bestPricePerKm = pricePerKm.length > 0 ? Math.min(...pricePerKm) : 0; // Lower is better
    const worstPricePerKm = pricePerKm.length > 0 ? Math.max(...pricePerKm) : 0;

    // Cost by day
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const costByDay = totalCost / daysDiff;

    // Cost by km
    const totalDistance = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    const costByKm = totalDistance > 0 ? totalCost / totalDistance : 0;

    // Group by fuel type
    const byFuelType = sorted.reduce((acc, curr) => {
      const type = curr.fuelType;
      if (!acc[type]) {
        acc[type] = {
          totalCost: 0,
          totalLiters: 0,
          count: 0,
          efficiencies: [] as number[],
          pricePerKm: [] as number[],
          lastOdometer: 0,
        };
      }
      
      acc[type].totalCost += Number(curr.totalCost);
      acc[type].totalLiters += Number(curr.liters);
      acc[type].count += 1;

      // Efficiency calculation within group needs sequential records of same fuel type?
      // Or just any record where current is that fuel type?
      // Usually efficiency is attributed to the fuel used to cover the distance.
      // If I fill up with Gas, drive 100km, then fill with Ethanol. The 100km was on Gas.
      // So the efficiency record associated with the Ethanol fill-up actually reflects the Gas usage.
      // This is complex. For simplicity, let's attribute efficiency to the fuel type of the *previous* fill-up?
      // Or just assume the current fill-up type reflects the usage? 
      // Standard practice: The fuel you just burned is what determines efficiency.
      // But the record is created when you fill up *again*.
      // So if I fill Gas (A), drive, fill Ethanol (B). The efficiency calculated at B is for Gas (A).
      // Let's stick to the current record's fuel type for now as an approximation, or simpler:
      // Just aggregate totals for now, efficiency per fuel type requires strict tracking.
      
      return acc;
    }, {} as Record<string, any>);

    return {
      totalCost,
      costByDay,
      costByKm,
      totalLiters,
      avgEfficiency,
      lastEfficiency,
      bestEfficiency,
      worstEfficiency,
      lastPricePerKm,
      bestPricePerKm,
      worstPricePerKm,
      byFuelType
    };
  }, [abastecimentos]);

  if (!stats) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Dados insuficientes para gerar relatórios neste período.
      </div>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Métricas Detalhadas</CardTitle>
        <p className="text-xs text-muted-foreground">
          {periodLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Custos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              label="Total" 
              value={formatCurrency(stats.totalCost)} 
            />
            <StatCard 
              label="Por dia" 
              value={formatCurrency(stats.costByDay)} 
            />
            <StatCard 
              label="Por km" 
              value={formatCurrency(stats.costByKm)} 
            />
          </div>
        </section>

        {/* Fuel Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Combustível</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              label="Volume Total" 
              value={`${stats.totalLiters.toFixed(1)} L`} 
            />
            <StatCard 
              label="Média Geral" 
              value={`${stats.avgEfficiency.toFixed(2)} km/L`} 
            />
          </div>
        </section>

        {/* Efficiency Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Eficiência (Km/L)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard 
              label="Última" 
              value={stats.lastEfficiency} 
              suffix="km/L"
            />
            <ComparisonCard 
              label="Melhor" 
              value={stats.bestEfficiency} 
              suffix="km/L"
              highlight="green"
            />
            <ComparisonCard 
              label="Pior" 
              value={stats.worstEfficiency} 
              suffix="km/L"
              highlight="red"
            />
          </div>
        </section>

        {/* Price/Km Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Preço / Km</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard 
              label="Último" 
              value={stats.lastPricePerKm} 
              isCurrency
            />
            <ComparisonCard 
              label="Menor" 
              value={stats.bestPricePerKm} 
              isCurrency
              highlight="green"
            />
            <ComparisonCard 
              label="Maior" 
              value={stats.worstPricePerKm} 
              isCurrency
              highlight="red"
            />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/50 p-3 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}

function ComparisonCard({ 
  label, 
  value, 
  suffix = "", 
  isCurrency = false,
  highlight 
}: { 
  label: string; 
  value: number; 
  suffix?: string; 
  isCurrency?: boolean;
  highlight?: "green" | "red";
}) {
  const colorClass = highlight === "green" ? "text-emerald-600 dark:text-emerald-400" : highlight === "red" ? "text-red-600 dark:text-red-400" : "";
  
  return (
    <div className="rounded-lg border bg-card/50 p-3 flex flex-col items-center justify-center text-center">
      <span className={`text-[10px] font-medium mb-1 uppercase tracking-wider ${highlight ? colorClass : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className="text-base font-bold">
        {isCurrency ? formatCurrency(value) : value.toFixed(2)} {suffix}
      </span>
    </div>
  );
}
