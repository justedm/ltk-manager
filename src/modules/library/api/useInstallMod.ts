import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/Toast";
import { m } from "@/i18n";
import { api, type AppError, type InstalledMod, type InstallOutcome } from "@/lib/tauri";
import { unwrapForQuery } from "@/utils/query";

import { libraryKeys } from "./keys";

/**
 * Hook to install a mod from a .modpkg file.
 */
export function useInstallMod() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<InstallOutcome, AppError, string>({
    mutationFn: async (filePath) => {
      const result = await api.installMod(filePath);
      return unwrapForQuery(result);
    },
    onSuccess: (outcome) => {
      const mod = outcome.mod;
      if (outcome.kind === "alreadyInstalled") {
        toast.info(
          m.library_import_already_installed_title(),
          m.library_install_already_installed_description({ name: mod.displayName }),
        );
        return;
      }

      if (outcome.kind === "updated") {
        toast.success(
          m.library_mod_update_success_title(),
          m.library_install_updated_description({ name: mod.displayName, version: mod.version }),
        );
      } else {
        queryClient.setQueryData<InstalledMod[]>(libraryKeys.mods(), (old) =>
          old ? [mod, ...old] : [mod],
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.mods() });
    },
  });
}
