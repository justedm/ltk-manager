// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import type { Incident, ScanStatus } from "@/lib/tauri";
import { createMockIncident } from "@/modules/diagnostics/components/__tests__/fixtures";

import { pickPrimaryStatus, SCAN_STATUS_MESSAGES, scanRejectionCause } from "../scanStatus";

const ALL: ScanStatus[] = [
  "missing-bin",
  "corrupt",
  "out-of-memory",
  "base-skin",
  "base-wad",
  "unknown",
];

function rejected(overrides: Partial<Incident>): Incident {
  return createMockIncident({
    verdict: {
      kind: "archive-rejected",
      title: "Archive Scan Rejection",
      titleOverride: null,
      cause: "",
      subject: "graves.wad.client",
      consequence: "overlay-off",
      hints: [],
    },
    scanRejected: 1,
    shader: null,
    ...overrides,
  });
}

describe("SCAN_STATUS_MESSAGES", () => {
  it("says something for every status the backend can report", () => {
    for (const status of ALL) {
      const message = SCAN_STATUS_MESSAGES[status];
      expect(message.title, status).toBeTruthy();
      expect(message.lead, status).toBeTruthy();
      expect(message.fix, status).toBeTruthy();
    }
  });
});

describe("pickPrimaryStatus", () => {
  it("falls back when a burst has different statuses", () => {
    expect(pickPrimaryStatus(["corrupt", "base-wad"])).toBe("unknown");
  });

  it("keeps a uniform burst's own status", () => {
    expect(pickPrimaryStatus(["base-skin", "base-skin"])).toBe("base-skin");
  });
});

describe("scanRejectionCause", () => {
  it("names the code only for a status it cannot read", () => {
    const cause = scanRejectionCause(
      rejected({ scanStatus: "unknown", scanStatusCode: "deadbeef" }),
    );
    expect(cause).toContain("deadbeef");
    expect(
      scanRejectionCause(rejected({ scanStatus: "corrupt", scanStatusCode: "c000003e" })),
    ).not.toContain("c000003e");
  });

  it("counts the archives the verdict does not name", () => {
    expect(scanRejectionCause(rejected({ scanStatus: "corrupt", scanRejected: 3 }))).toContain(
      "2 more archives failed the scan.",
    );
    expect(scanRejectionCause(rejected({ scanStatus: "corrupt", scanRejected: 2 }))).toContain(
      "1 more archive failed the scan.",
    );
  });

  it("uses a stored cause when one exists", () => {
    const cause = scanRejectionCause(
      createMockIncident({
        verdict: {
          kind: "archive-rejected",
          title: "Archive Scan Rejection",
          titleOverride: null,
          cause: "The scan rejected graves.wad.client.",
          subject: "graves.wad.client",
          consequence: "overlay-off",
          hints: [],
        },
        scanStatus: "corrupt",
      }),
    );
    expect(cause).toBe("The scan rejected graves.wad.client.");
  });

  /// Every other verdict still writes its own sentence on the backend, so the
  /// helper is the one call site the card needs for all of them.
  it("passes a verdict that is not a scan rejection straight through", () => {
    const incident = createMockIncident({ scanStatus: null });
    expect(scanRejectionCause(incident)).toBe(incident.verdict.cause);
  });

  it("says nothing when a rejection has no status to read", () => {
    expect(scanRejectionCause(rejected({ scanStatus: null }))).toBe("");
  });
});
