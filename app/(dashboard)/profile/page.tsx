import { getUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ApiTokenCard } from "./api-token-card";
import { PageTitle } from "@/components/page-title";

export default async function ProfilePage() {
  const { user } = await getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <PageTitle title="API Token" />
      <p className="text-muted-foreground">
        O token de API permite que você interaja com seus dados de forma
        programática.
      </p>

      <ApiTokenCard currentApiToken={user.apiToken} />
    </div>
  );
}
