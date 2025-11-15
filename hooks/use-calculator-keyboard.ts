import { useEffect } from "react";

type UseCalculatorKeyboardParams = {
  canCopy: boolean;
  onCopy: () => void | Promise<void>;
  onPaste: () => void | Promise<void>;
};

function shouldIgnoreForEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function useCalculatorKeyboard({
  canCopy,
  onCopy,
  onPaste,
}: UseCalculatorKeyboardParams) {
  useEffect(() => {
    if (!canCopy) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (shouldIgnoreForEditableTarget(event.target)) {
        return;
      }

      if (event.key.toLowerCase() !== "c") {
        return;
      }

      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      event.preventDefault();
      void onCopy();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [canCopy, onCopy]);

  useEffect(() => {
    const handlePasteShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (event.key.toLowerCase() !== "v") {
        return;
      }

      if (shouldIgnoreForEditableTarget(event.target)) {
        return;
      }

      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      if (!navigator.clipboard?.readText) {
        return;
      }

      event.preventDefault();
      void onPaste();
    };

    document.addEventListener("keydown", handlePasteShortcut);

    return () => {
      document.removeEventListener("keydown", handlePasteShortcut);
    };
  }, [onPaste]);
}
