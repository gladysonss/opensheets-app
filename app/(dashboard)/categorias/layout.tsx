import PageDescription from "@/components/page-description";
import { RiPriceTag3Line } from "@remixicon/react";

export const metadata = {
  title: "Categorias | Opensheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiPriceTag3Line />}
        title="Categorias"
        subtitle="Gerencie suas categorias de despesas e receitas acompanhando o histórico de desempenho dos últimos 9 meses, permitindo ajustes financeiros precisos conforme necessário."
      />
      {children}
    </section>
  );
}
