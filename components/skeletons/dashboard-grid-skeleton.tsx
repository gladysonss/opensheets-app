import { SectionCardsSkeleton } from "./section-cards-skeleton";
import { WidgetSkeleton } from "./widget-skeleton";

/**
 * Skeleton completo para o dashboard grid
 * Mantém a mesma estrutura de layout do dashboard real
 */
export function DashboardGridSkeleton() {
  return (
    <div className="@container/main space-y-4">
      {/* Section Cards no topo */}
      <SectionCardsSkeleton />

      {/* Grid de widgets */}
      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @7xl/main:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <WidgetSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
