"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";

export function SidebarSwipeGesture() {
  const { toggleSidebar, openMobile, isMobile } = useSidebar();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start gesture from the left edge (first 70px) to avoid conflict with back gesture
      if (e.touches[0].clientX > 100) return;
      
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = Math.abs(touchEndY - touchStartY.current);

      // Check for horizontal swipe (right) with minimal vertical movement
      if (deltaX > 50 && deltaY < 30) {
        if (!openMobile) {
          toggleSidebar();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, openMobile, toggleSidebar]);

  return null;
}
