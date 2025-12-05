import { InsightsPage } from "@/components/insights/insights-page";
import MonthPicker from "@/components/month-picker/month-picker";
import { parsePeriodParam } from "@/lib/utils/period";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

type PageProps = {
  searchParams?: PageSearchParams;
};

const getSingleParam = (
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) => {
  const value = params?.[key];
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const periodoParam = getSingleParam(resolvedSearchParams, "periodo");
  const { period: selectedPeriod } = parsePeriodParam(periodoParam);

  return (
    <main className="flex flex-col gap-6">
      <MonthPicker serverDate={new Date()} />
      <InsightsPage period={selectedPeriod} />
    </main>
  );
}
