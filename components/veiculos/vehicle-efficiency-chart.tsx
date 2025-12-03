"use client";

import { WidgetEmptyState } from "@/components/widget-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RiLineChartLine } from "@remixicon/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  LabelList,
  type LabelProps,
} from "recharts";

export type VehicleEfficiencyPoint = {
  label: string;
  efficiency: number | null; // Km/L
};

const chartConfig = {
  efficiency: {
    label: "Eficiência (Km/L)",
    color: "hsl(142.1 76.2% 36.3%)", // Green
  },
};

type VehicleEfficiencyChartProps = {
  data: VehicleEfficiencyPoint[];
};

const ValueLabel = (props: LabelProps) => {
  const { x, y, value } = props;
  if (typeof x !== "number" || typeof y !== "number" || value === undefined || value === null) {
    return null;
  }
  
  return (
    <text
      x={x}
      y={y - 10}
      fill="currentColor"
      textAnchor="middle"
      className="text-[11px] font-semibold text-muted-foreground"
    >
      {Number(value).toFixed(1)}
    </text>
  );
};

export function VehicleEfficiencyChart({ data }: VehicleEfficiencyChartProps) {
  // Check if there is any valid data point
  const hasData = data.some((point) => point.efficiency !== null && point.efficiency > 0);

  return (
    <Card className="border flex flex-col h-full">
      <CardHeader className="gap-1.5 pb-3">
        <CardTitle className="text-lg font-semibold">
          Eficiência (Km/L)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Média de consumo nos últimos 6 meses.
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pt-0 pb-6">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto flex h-[300px] w-full max-w-full items-center justify-center aspect-auto"
          >
            <LineChart
              data={data}
              margin={{ top: 28, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                hide 
                domain={['dataMin - 2', 'dataMax + 2']} 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="var(--color-efficiency)"
                strokeWidth={2}
                connectNulls
                dot={{
                  r: 4,
                  fill: "var(--color-efficiency)",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList dataKey="efficiency" content={<ValueLabel />} />
              </Line>
            </LineChart>
          </ChartContainer>
        ) : (
          <WidgetEmptyState
            icon={<RiLineChartLine className="size-6 text-muted-foreground" />}
            title="Sem dados de eficiência"
            description="Registre abastecimentos com odômetro para ver o gráfico."
          />
        )}
      </CardContent>
    </Card>
  );
}
