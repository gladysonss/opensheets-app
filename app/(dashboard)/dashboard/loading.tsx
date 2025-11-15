import { DashboardGridSkeleton } from "@/components/skeletons";

/**
 * Loading state para a página do dashboard
 * Usa skeleton fiel ao layout final para evitar layout shift
 */
export default function DashboardLoading() {
  return (
    <main className="flex flex-col gap-6 px-6">
      {/* Month Picker placeholder */}
      <div className="h-[60px] animate-pulse rounded-2xl bg-foreground/10" />

      {/* Dashboard content skeleton */}
      <DashboardGridSkeleton />
    </main>
  );
}
