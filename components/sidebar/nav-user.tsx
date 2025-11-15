"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAvatarSrc } from "@/lib/pagadores/utils";
import Image from "next/image";
import { useMemo } from "react";

type NavUserProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  pagadorAvatarUrl: string | null;
};

export function NavUser({ user, pagadorAvatarUrl }: NavUserProps) {
  useSidebar();

  // Lógica de fallback: user.image (Google) > pagador avatar > default
  const avatarSrc = useMemo(() => {
    if (user.image) {
      return user.image;
    }
    return getAvatarSrc(pagadorAvatarUrl);
  }, [user.image, pagadorAvatarUrl]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground "
        >
          <Image
            src={avatarSrc}
            alt={user.name}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
