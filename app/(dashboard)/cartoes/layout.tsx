import PageDescription from "@/components/page-description";
import { RiBankCardLine } from "@remixicon/react";

export const metadata = {
  title: "Cartões | OpenSheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiBankCardLine />}
        title="Cartões"
        subtitle="Acompanhe todas os cartões do mês selecionado incluindo faturas, limites
        e transações previstas. Use o seletor abaixo para navegar pelos meses e
        visualizar as movimentações correspondentes."
      />
      {children}
    </section>
  );
}
