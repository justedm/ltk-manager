import { useCallback } from "react";

import { useToast } from "@/components";
import { errorMessage, m } from "@/i18n";
import { type PatcherConfig } from "@/lib/tauri";
import { useStartPatcher } from "@/modules/patcher";

/**
 * Shared start path for both the manual and auto-start flows.
 *
 * Linked-bin dependency issues are no longer gated here: missing linked bins are
 * non-fatal at injection, so the single overlay build inside `start_patcher` records
 * any offenders as a byproduct. They surface afterwards as per-mod badges and a
 * one-time warning toast (see `useSurfaceLinkedBinWarning`) — no pre-flight build,
 * no blocking dialog before the patch.
 */
export function useGuardedStartPatcher() {
  const startPatcher = useStartPatcher();
  const toast = useToast();

  const start = useCallback(
    async (config: PatcherConfig = {}) => {
      if (startPatcher.isPending) return;

      try {
        await startPatcher.mutateAsync(config);
      } catch (error) {
        toast.error(m.patcher_start_failed_title(), errorMessage(error));
        console.error("Failed to start patcher:", error);
      }
    },
    [startPatcher, toast],
  );

  return { start };
}
