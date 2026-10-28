// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VerdictCard } from "../VerdictCard";
import { createMockIncident } from "./fixtures";

describe("VerdictCard", () => {
  it("reads the verdict's own title for an ordinary incident", () => {
    render(<VerdictCard incident={createMockIncident()} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Missing Game Data" }),
    ).toBeInTheDocument();
  });

  it("uses the generic title and appearance for an archive rejection", () => {
    const { container } = render(
      <VerdictCard
        incident={createMockIncident({
          verdict: {
            kind: "archive-rejected",
            title: "Archive Scan Rejection",
            titleOverride: null,
            cause: "",
            subject: "Graves.wad.client",
            consequence: "overlay-off",
            hints: [],
          },
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Archive Scan Rejection" }),
    ).toBeInTheDocument();
    expect(container.querySelector("section")?.className).not.toContain("void");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
