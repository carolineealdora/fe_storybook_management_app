import { useEffect } from "react";
import { useBlocker } from "react-router";
import { readNavState } from "@/lib/navigation-state";
import { ConfirmDialog } from "./ConfirmDialog";

interface LeaveGuardProps {
  /** Block leaving while true (the form has unsaved changes). */
  when: boolean;
  message: string;
}

/**
 * Asks before leaving the page while `when` is true: in-app navigation shows a dialog,
 * closing or reloading the tab shows the browser's own prompt. A navigation whose
 * state has `confirmedLeave: true` (e.g. the redirect after saving) goes through.
 */
export function LeaveGuard({ when, message }: LeaveGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when &&
      currentLocation.pathname !== nextLocation.pathname &&
      !readNavState(nextLocation.state).confirmedLeave,
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      title="Leave without saving?"
      confirmLabel="Leave page"
      confirmVariant="danger"
      cancelLabel="Keep editing"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      {message}
    </ConfirmDialog>
  );
}
