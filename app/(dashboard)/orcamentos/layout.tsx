import PageDescription from "@/components/page-description";
import { RiFundsLine } from "@remixicon/react";

export const metadata = {
  title: "Anotações | OpenSheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiFundsLine />}
        title="Orçamentos"
        subtitle="Gerencie seus orçamentos mensais por categorias. Acompanhe o progresso do seu orçamento e faça ajustes conforme necessário."
      />
      {children}
    </section>
  );
}
