"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { type Abastecimento } from "@/db/schema";

interface VehiclePerformanceChartsProps {
  abastecimentos: Abastecimento[];
}

export function VehiclePerformanceCharts({
  abastecimentos,
}: VehiclePerformanceChartsProps) {
  const data = useMemo(() => {
    // Sort by date/odometer ascending
    const sorted = [...abastecimentos].sort((a, b) => {
      if (a.date === b.date) {
        return a.odometer - b.odometer;
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const efficiencyData = [];
    const costByMonth: Record<string, number> = {};

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = sorted[i - 1];

      const distance = current.odometer - previous.odometer;
      const liters = Number(current.liters);
      
      // Basic validation to avoid division by zero or negative distance
      if (distance > 0 && liters > 0) {
        const kmPerLiter = distance / liters;
        efficiencyData.push({
          date: formatDate(new Date(current.date).toISOString().split("T")[0]),
          kmPerLiter: Number(kmPerLiter.toFixed(2)),
          odometer: current.odometer,
        });
      }
    }

    sorted.forEach((a) => {
      const date = new Date(a.date);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      costByMonth[monthKey] = (costByMonth[monthKey] || 0) + Number(a.totalCost);
    });

    const costData = Object.entries(costByMonth).map(([month, cost]) => ({
      month,
      cost,
    }));

    return { efficiencyData, costData };
  }, [abastecimentos]);

  if (abastecimentos.length < 2) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eficiência (Km/L)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Dados insuficientes para calcular eficiência.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Dados insuficientes.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Eficiência (Km/L)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="kmPerLiter"
                  stroke="#8884d8"
                  name="Km/L"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custo Mensal (Combustível)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="cost" fill="#82ca9d" name="Custo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
