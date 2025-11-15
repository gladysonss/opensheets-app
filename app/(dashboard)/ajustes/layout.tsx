import PageDescription from "@/components/page-description";
import { RiSettingsLine } from "@remixicon/react";

export const metadata = {
  title: "Ajustes | OpenSheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 px-6">
      <PageDescription
        icon={<RiSettingsLine />}
        title="Ajustes"
        subtitle="Gerencie informações da conta, segurança e outras opções para otimizar sua experiência."
      />
      {children}
    </section>
  );
}
