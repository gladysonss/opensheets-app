import { NotificationBell } from "@/components/notifications/notification-bell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { DashboardNotificationsSnapshot } from "@/lib/dashboard/notifications";
import { AnimatedThemeToggler } from "./animated-theme-toggler";
import { PrivacyModeToggle } from "./privacy-mode-toggle";
import { CalculatorDialogButton } from "./calculadora/calculator-dialog";
import { UserNav } from "./user-nav";

type SiteHeaderProps = {
  notificationsSnapshot: DashboardNotificationsSnapshot;
};

export function SiteHeader({ notificationsSnapshot }: SiteHeaderProps) {
  return (
    <header className="border-b flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-2">
          <CalculatorDialogButton withTooltip />
          <span className="text-muted-foreground">|</span>
          <NotificationBell
            notifications={notificationsSnapshot.notifications}
            totalCount={notificationsSnapshot.totalCount}
          />
          <PrivacyModeToggle />
          <AnimatedThemeToggler />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
