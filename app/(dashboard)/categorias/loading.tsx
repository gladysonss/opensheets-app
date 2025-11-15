import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state para a página de categorias
 * Layout: Header + Tabs + Grid de cards
 */
export default function CategoriasLoading() {
  return (
    <main className="flex flex-col items-start gap-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 rounded-2xl bg-foreground/10" />
          <Skeleton className="h-10 w-40 rounded-2xl bg-foreground/10" />
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-2 border-b">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-32 rounded-t-2xl bg-foreground/10"
              />
            ))}
          </div>

          {/* Grid de cards de categorias */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6 space-y-4"
              >
                {/* Ícone + Nome */}
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-2xl bg-foreground/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full rounded-2xl bg-foreground/10" />
                    <Skeleton className="h-4 w-16 rounded-2xl bg-foreground/10" />
                  </div>
                </div>

                {/* Descrição */}
                {i % 3 === 0 && (
                  <Skeleton className="h-4 w-full rounded-2xl bg-foreground/10" />
                )}

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2 border-t">
                  <Skeleton className="h-9 flex-1 rounded-2xl bg-foreground/10" />
                  <Skeleton className="h-9 w-9 rounded-2xl bg-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
