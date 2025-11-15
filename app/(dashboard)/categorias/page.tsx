import { CategoriesPage } from "@/components/categorias/categories-page";
import { getUserId } from "@/lib/auth/server";
import { fetchCategoriesForUser } from "./data";

export default async function Page() {
  const userId = await getUserId();
  const categories = await fetchCategoriesForUser(userId);

  return (
    <main className="flex flex-col items-start gap-6">
      <CategoriesPage categories={categories} />
    </main>
  );
}
