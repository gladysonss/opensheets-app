import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/ajustes/settings-tabs";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  if (!user) {
    redirect("/");
  }

  const userName = user.name || "";
  const userEmail = user.email || "";
  const apiToken = user.apiToken;

  const userAccount = await db.query.account.findFirst({
    where: eq(schema.account.userId, session.user.id),
  });

  const authProvider = userAccount?.providerId || "credential";

  return (
    <div className="max-w-3xl">
      <SettingsTabs
        userName={userName}
        userEmail={userEmail}
        apiToken={apiToken}
        authProvider={authProvider}
      />
    </div>
  );
}
