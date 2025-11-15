import { AccountsPage } from "@/components/contas/accounts-page";
import { getUserId } from "@/lib/auth/server";
import { fetchAccountsForUser } from "./data";

export default async function Page() {
  const userId = await getUserId();
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const { accounts, logoOptions } = await fetchAccountsForUser(
    userId,
    currentPeriod
  );

  return (
    <main className="flex flex-col items-start gap-6">
      <AccountsPage accounts={accounts} logoOptions={logoOptions} />
    </main>
  );
}
