"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markAllUpdatesAsRead } from "@/lib/changelog/actions";
import type { ChangelogEntry } from "@/lib/changelog/data";
import {
  getCategoryLabel,
  groupEntriesByCategory,
} from "@/lib/changelog/utils";
import { cn } from "@/lib/utils";
import { RiMegaphoneLine } from "@remixicon/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface ChangelogNotificationProps {
  unreadCount: number;
  entries: ChangelogEntry[];
}

export function ChangelogNotification({
  unreadCount: initialUnreadCount,
  entries,
}: ChangelogNotificationProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    const updateIds = entries.map((e) => e.id);
    await markAllUpdatesAsRead(updateIds);
    setUnreadCount(0);
  };

  const grouped = groupEntriesByCategory(entries);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "group relative text-muted-foreground transition-all duration-200",
                "hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40",
                "data-[state=open]:bg-accent/60 data-[state=open]:text-foreground border"
              )}
            >
              <RiMegaphoneLine className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  variant="info"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Novidades</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <RiMegaphoneLine className="h-5 w-5" />
            <h3 className="font-semibold">Novidades</h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs"
            >
              Marcar todas como lida
            </Button>
          )}
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {Object.entries(grouped).map(([category, categoryEntries]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {getCategoryLabel(category)}
                </h4>
                <div className="space-y-2">
                  {categoryEntries.map((entry) => (
                    <div key={entry.id} className="space-y-1">
                      <div className="flex items-start gap-2 border-b pb-2 border-dashed">
                        <span className="text-lg mt-0.5">{entry.icon}</span>
                        <div className="flex-1 space-y-1">
                          <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            #{entry.id.substring(0, 7)}
                          </code>
                          <p className="text-sm leading-tight flex-1 first-letter:capitalize">
                            {entry.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(entry.date), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Nenhuma atualização recente
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
