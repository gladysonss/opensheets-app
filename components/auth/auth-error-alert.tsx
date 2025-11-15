import { Alert, AlertDescription } from "@/components/ui/alert";
import { RiTerminalLine } from "@remixicon/react";

interface AuthErrorAlertProps {
  error: string;
}

export function AuthErrorAlert({ error }: AuthErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert className="mt-2 border border-red-500" variant="destructive">
      <RiTerminalLine className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
