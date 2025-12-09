import { SignupForm } from "@/components/auth/signup-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense fallback={<div>Carregando...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
