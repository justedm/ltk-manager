import { useCallback } from "react";

import { useToast } from "@/components/Toast";
import { errorMessage, m } from "@/i18n";
import { type PatcherConfig } from "@/lib/tauri";
import { useStartPatcher } from "@/modules/patcher/api";

/**
 * Shared start path for both the manual and auto-start flows. It force-disables any
 * enabled skinhack mods (which would crash the game), then starts the patcher.
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
