"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import React from "react";

interface NavigationButtonProps {
  direction: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}

const NavigationButton = React.memo(
  ({ direction, disabled, onClick }: NavigationButtonProps) => {
    const Icon = direction === "left" ? RiArrowLeftSLine : RiArrowRightSLine;

    return (
      <button
        onClick={onClick}
        className="text-month-picker-foreground transition-all duration-200 cursor-pointer rounded-lg p-1 hover:bg-month-picker-foreground/10 focus:outline-hidden focus:ring-2 focus:ring-month-picker-foreground/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        disabled={disabled}
        aria-label={`Navegar para o mês ${
          direction === "left" ? "anterior" : "seguinte"
        }`}
      >
        <Icon className="text-primary" size={18} />
      </button>
    );
  }
);

NavigationButton.displayName = "NavigationButton";

export default NavigationButton;
