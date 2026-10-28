import { m } from "@/i18n";
import type { Incident } from "@/lib/tauri";

import { verdictCause } from "../utils/incident";
import { ConsequenceChip } from "./ConsequenceChip";
import { VerdictGlyph } from "./VerdictGlyph";

interface VerdictCardProps {
  incident: Incident;
}

/** The verdict as the player reads it first: the title, what it cost, and the cause. */
export function VerdictCard({ incident }: VerdictCardProps) {
  const { verdict } = incident;

  return (
    <section
      data-ui="VerdictCard"
      className="flex items-start rounded-lg border border-surface-700/50 bg-surface-900/95"
    >
      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Glyphs take the -text variant: DS-TEXT. */}
          <VerdictGlyph kind={verdict.kind} className="mt-0.5 size-5 shrink-0" />
          <h2 className="text-base font-semibold text-surface-100">{verdict.title}</h2>
          <ConsequenceChip consequence={verdict.consequence} />
          {incident.dismissed && (
            <span className="inline-flex h-5 items-center rounded-sm border border-surface-600 px-1.5 text-fine font-medium tracking-wider text-surface-400 uppercase">
              {m.diagnostics_dismissed_label()}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-surface-300">{verdictCause(incident)}</p>
        {verdict.subject && (
          /* An inset inside a card is the one place a lower rung is right: DS-GROUND. */
          <p
            data-ui="VerdictCard:subject"
            className="mt-3 rounded-md border border-surface-700/60 bg-surface-950/50 px-2 py-1.5 font-mono text-xs break-all text-surface-100"
          >
            {verdict.subject}
          </p>
        )}
      </div>
    </section>
  );
}
