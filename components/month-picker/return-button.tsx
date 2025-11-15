"use client";

import React from "react";
import { Button } from "../ui/button";

interface ReturnButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

const ReturnButton = React.memo(({ disabled, onClick }: ReturnButtonProps) => {
  return (
    <Button
      className="w-28 h-6"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-label="Retornar para o mês atual"
    >
      Mês Atual
    </Button>
  );
});

ReturnButton.displayName = "ReturnButton";

export default ReturnButton;
