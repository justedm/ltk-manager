// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import type { Verdict } from "@/lib/tauri";
import { createMockIncident } from "@/modules/diagnostics/components/__tests__/fixtures";

import { describeExitCode, subjectLine, verdictCause } from "../incident";

describe("describeExitCode", () => {
  /// The bare number is a reader's only clue to what killed the game, so the
  /// name Windows gives it goes beside the code.
  it("names an NTSTATUS the table knows", () => {
    expect(describeExitCode(-1073741819)).toBe("0xC0000005 STATUS_ACCESS_VIOLATION");
  });

  /// The token carries the code as a number, and the client may hand the same
  /// value back unsigned.
  it("reads the unsigned spelling as the same code", () => {
    expect(describeExitCode(0xc0000005)).toBe("0xC0000005 STATUS_ACCESS_VIOLATION");
  });

  it("keeps the hex for a status with no name", () => {
    expect(describeExitCode(-1073741000)).toBe("0xC0000338");
  });

  it("leaves a plain exit code as a number", () => {
    expect(describeExitCode(0)).toBe("0");
    expect(describeExitCode(3)).toBe("3");
  });
});

describe("subjectLine", () => {
  /// The rail is too narrow for a game path, and the card shows it whole.
  it("shortens a path to its file name", () => {
    const incident = createMockIncident();

    expect(incident.verdict.subject).toContain("/");
    expect(subjectLine(incident)).toBe("aatrox_skin12_tx_cm.dds");
  });

  it("leaves a subject that is not a path alone", () => {
    const incident = createMockIncident({
      verdict: { ...createMockIncident().verdict, subject: "step 52 of 64" },
    });

    expect(subjectLine(incident)).toBe("step 52 of 64");
  });

  it("falls back to the first suspect when there is no subject", () => {
    const incident = createMockIncident({
      verdict: { ...createMockIncident().verdict, subject: null },
    });

    expect(subjectLine(incident)).toBe("Aatrox Justicar");
  });
});

describe("verdictCause", () => {
  const shaderVerdict: Verdict = {
    kind: "shader-failed",
    title: "Shader Compilation Failure",
    cause: "",
    subject: "FEATURE_DISPLACEMENT=1 NUM_BLEND_WEIGHTS=4",
    consequence: "game-stopped",
    titleOverride: null,
    hints: ["shader-definition", "disable-suspect"],
  };

  /// A shader defined outside the shaders bin: four variants with no programs,
  /// then the material they belonged to drawn with no pipeline.
  it("words a shader failure from the facts the log gave", () => {
    const incident = createMockIncident({
      verdict: shaderVerdict,
      shader: { variants: 4, unnamedPrograms: true, missingPipeline: "822941f5adffbcc" },
    });

    expect(verdictCause(incident)).toBe(
      "League could not compile 4 shader variants, and then drew a material that had no pipeline. The failed compiles name no vertex shader. League builds shader programs only for the CustomShaderDef objects in data/shaders/shaders.bin, so a mod that defines a shader in any other bin replaces the game's copy with one that has no programs.",
    );
  });

  it("reads one variant with its programs named on its own", () => {
    const incident = createMockIncident({
      verdict: shaderVerdict,
      shader: { variants: 1, unnamedPrograms: false, missingPipeline: null },
    });

    expect(verdictCause(incident)).toBe("League could not compile 1 shader variant.");
  });

  it("reads a missing pipeline with no failed compile", () => {
    const incident = createMockIncident({
      verdict: shaderVerdict,
      shader: { variants: 0, unnamedPrograms: false, missingPipeline: "822941f5adffbcc" },
    });

    expect(verdictCause(incident)).toBe("League drew a material that had no pipeline.");
  });

  it("keeps the backend's sentence where it wrote one", () => {
    expect(verdictCause(createMockIncident())).toBe("League failed to read a file.");
  });
});
