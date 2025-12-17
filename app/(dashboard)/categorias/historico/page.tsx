import { CategoryHistoryWidget } from "@/components/dashboard/category-history-widget";
import { getUser } from "@/lib/auth/server";
import { fetchCategoryHistory } from "@/lib/dashboard/categories/category-history";
import { getCurrentPeriod } from "@/lib/utils/period";

export default async function HistoricoCategoriasPage() {
  const user = await getUser();
  const currentPeriod = getCurrentPeriod();

  const data = await fetchCategoryHistory(user.id, currentPeriod);

  return (
    <main>
      <CategoryHistoryWidget data={data} />
    </main>
  );
}
