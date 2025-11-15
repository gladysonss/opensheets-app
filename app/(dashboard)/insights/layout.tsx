import PageDescription from "@/components/page-description";
import { RiSparklingLine } from "@remixicon/react";

export const metadata = {
  title: "Insights | OpenSheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiSparklingLine />}
        title="Insights"
        subtitle="Análise inteligente dos seus dados financeiros para identificar padrões, comportamentos e oportunidades de melhoria."
      />
      {children}
    </section>
  );
}
