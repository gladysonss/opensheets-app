import { DeleteAccountForm } from "@/components/ajustes/delete-account-form";
import { UpdateEmailForm } from "@/components/ajustes/update-email-form";
import { UpdateNameForm } from "@/components/ajustes/update-name-form";
import { UpdatePasswordForm } from "@/components/ajustes/update-password-form";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiTokenCard } from "./api-token-card";

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
      <Tabs defaultValue="nome" className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-2">
          <TabsTrigger value="nome">Seu Nome</TabsTrigger>
          <TabsTrigger value="senha">Senha</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="token">Token de API</TabsTrigger>
          <TabsTrigger value="deletar" className="text-destructive">
            Deletar Conta
          </TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <TabsContent value="nome" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Alterar nome</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Atualize como seu nome aparece no Opensheets.
              </p>
            </div>
            <UpdateNameForm currentName={userName} />
          </TabsContent>

          <TabsContent value="senha" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Alterar senha</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Defina uma nova senha para sua conta. Guarde-a em local seguro.
              </p>
            </div>
            <UpdatePasswordForm authProvider={authProvider} />
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Alterar e-mail</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Atualize o e-mail associado à sua conta.
              </p>
            </div>
            <UpdateEmailForm
              currentEmail={userEmail}
              authProvider={authProvider}
            />
          </TabsContent>

          <TabsContent value="token" className="space-y-4">
            <ApiTokenCard token={apiToken} />
          </TabsContent>

          <TabsContent value="deletar" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1 text-destructive">
                Deletar conta
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sua conta e todos os dados serão excluídos permanentemente.
              </p>
            </div>
            <DeleteAccountForm />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
