import { FieldDescription } from "@/components/ui/field";

export function AuthFooter() {
  return (
    <FieldDescription className="px-6 text-center">
      Ao continuar, você concorda com nossos{" "}
      <a href="/terms" className="underline underline-offset-4">
        Termos de Serviço
      </a>{" "}
      e{" "}
      <a href="/privacy" className="underline underline-offset-4">
        Política de Privacidade
      </a>
      .
    </FieldDescription>
  );
}
