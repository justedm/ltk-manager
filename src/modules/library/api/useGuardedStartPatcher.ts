import { useCallback } from "react";

import { useToast } from "@/components/Toast";
import { errorMessage, m } from "@/i18n";
import { type PatcherConfig } from "@/lib/tauri";
import { useStartPatcher } from "@/modules/patcher/api";

/**
 * Starts the patcher from the manual and auto-start flows.
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
