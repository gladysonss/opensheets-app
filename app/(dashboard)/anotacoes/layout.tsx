import PageDescription from "@/components/page-description";
import { RiFileListLine } from "@remixicon/react";

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
        icon={<RiFileListLine />}
        title="Notas"
        subtitle="Gerencie suas anotações e mantenha o controle sobre suas ideias e tarefas."
      />
      {children}
    </section>
  );
}
