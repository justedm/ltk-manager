import { match } from "ts-pattern";

import { Checkbox } from "@/components";
import { SuspectBadge } from "@/modules/diagnostics";
import { twMerge } from "@/utils";

import { LayerPopover } from "../LayerPopover";
import { MissingDepsBadge } from "../MissingDepsBadge";
import { ModHealthBadge } from "../ModHealthBadge";
import {
  ModCardContextMenu,
  ModCardMenu,
  ModCardThumbnail,
  ModCardToggle,
  ModPills,
} from "./ModCardParts";
import type { ModCardView } from "./useModCardController";

export function ModCardList({ view }: { view: ModCardView }) {
  const {
    mod,
    thumbnailUrl,
    isMultiLayer,
    hasSelection,
    isSelected,
    inEnabledState,
    onCardClick,
    onSelectionToggle,
  } = view;

  const stateClass = match({ isSelected, isEnabled: inEnabledState })
    .with({ isSelected: true }, () => "border-accent-500 bg-surface-800 ring-2 ring-accent-400/60")
    /* The same three answers the row below gives a pointer. Enabled had only
       the 1px lift, which is nothing to see once it eases instead of jumping,
      and the dim coming off is what an off row was answering with. */
    .with(
      { isEnabled: true },
      () =>
        "border-accent-500/40 bg-surface-900 shadow-[0_0_10px_-4px] shadow-accent-500/20 hover:-translate-y-px hover:border-accent-500 hover:bg-surface-800/80 hover:shadow-md",
    )
    .otherwise(
      () =>
        "border-surface-700 bg-surface-900 hover:-translate-y-px hover:border-accent-hover hover:bg-surface-800/80 hover:shadow-md",
    );

  /* An off row's pills stop competing for the accent. */
  const dimClass = !inEnabledState && !isSelected ? "opacity-75 saturate-75" : "";

  /* Laid out at all times, so the row does not reflow as a pointer crosses it. */
  const checkboxClass = hasSelection
    ? ""
    : "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-within:opacity-100";

  /* The card is the trigger rather than a child of it, so the list keeps
     laying out the element it always did. */
  const row = (
    <div
      onClick={onCardClick}
      className={twMerge(
        "group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-[translate,box-shadow,background-color,border-color,opacity,filter] duration-150 ease-out",
        "hover:opacity-100 hover:saturate-100",
        dimClass,
        stateClass,
      )}
    />
  );

  return (
    <ModCardContextMenu view={view} card={row}>
      <span
        data-no-toggle
        onClick={(e) => e.stopPropagation()}
        className={twMerge("flex shrink-0 items-center", checkboxClass)}
      >
        <Checkbox
          size="md"
          checked={isSelected}
          onCheckedChange={onSelectionToggle}
          aria-label={`Select ${mod.displayName}`}
        />
      </span>
      <ModCardThumbnail
        variant="list"
        thumbnailUrl={thumbnailUrl}
        displayName={mod.displayName}
        lit={inEnabledState}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-medium text-surface-100">{mod.displayName}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm text-surface-500">
            v{mod.version} • {mod.authors.join(", ") || "Unknown author"}
          </p>
          <ModPills mod={mod} max={3} />
          {isMultiLayer && <LayerPopover mod={mod} />}
          <span data-no-toggle onClick={(e) => e.stopPropagation()}>
            <MissingDepsBadge modId={mod.id} enabled={mod.enabled} />
          </span>
        </div>
      </div>

      {/* Beside the switch rather than among the metadata: they are things to
          act on, and `empty:hidden` keeps a row with neither from holding the
          gap open for marks it does not draw.

          These three are `flex` so their control is a flex item rather than an
          inline one. A line box would hang the font's descender space under each
          button, which lands them all off the row's centre. */}
      <span
        data-no-toggle
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 items-center gap-1 empty:hidden"
      >
        <ModHealthBadge modId={mod.id} />
        <SuspectBadge modId={mod.id} enabled={mod.enabled} />
      </span>

      <div
        data-no-toggle
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 items-center"
      >
        <ModCardToggle view={view} />
      </div>

      <div
        data-no-toggle
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 items-center"
      >
        <ModCardMenu view={view} />
      </div>
    </ModCardContextMenu>
  );
}
