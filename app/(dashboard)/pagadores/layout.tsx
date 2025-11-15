import PageDescription from "@/components/page-description";
import { RiGroupLine } from "@remixicon/react";

export const metadata = {
  title: "Pagadores | OpenSheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiGroupLine />}
        title="Pagadores"
        subtitle="Gerencie as pessoas ou entidades responsáveis pelos pagamentos."
      />
      {children}
    </section>
  );
}
