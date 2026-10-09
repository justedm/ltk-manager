import { useCallback } from "react";

import type { InstalledMod } from "@/lib/tauri";

import { useToggleMod } from "./useToggleMod";

/**
 * Switch a set of mods on or off, skipping the ones already in that state.
 */
export function useSetModsEnabled() {
  const toggleMod = useToggleMod();

  const setEnabled = useCallback(
    (mods: InstalledMod[], enabled: boolean) => {
      for (const mod of mods) {
        if (mod.enabled === enabled) continue;
        toggleMod.mutate(
          { modId: mod.id, enabled },
          { onError: (error) => console.error("Failed to toggle mod:", error) },
        );
      }
    },
    [toggleMod],
  );

  return { setEnabled, isPending: toggleMod.isPending } as const;
}
