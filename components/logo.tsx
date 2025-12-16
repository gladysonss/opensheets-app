import { cn } from "@/lib/utils/ui";
import Image from "next/image";

interface LogoProps {
  variant?: "full" | "small";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "small") {
    return (
      <Image
        src="/logo_small.png"
        alt="Opensheets"
        width={32}
        height={32}
        className={cn("object-contain", className)}
        priority
      />
    );
  }

  return (
    <div className={cn("flex items-center py-4", className)}>
      <Image
        src="/logo_small.png"
        alt="Opensheets"
        width={28}
        height={28}
        className="object-contain"
        priority
      />
      <Image
        src="/logo_text.png"
        alt="Opensheets"
        width={100}
        height={32}
        className="object-contain dark:invert"
        priority
      />
    </div>
  );
}
