import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MotionPreferenceProvider, useMotionPreference } from "@/contexts/MotionPreferenceContext";
import DashboardVideoSection from "@/components/landing/DashboardVideoSection";

const Toggle = () => {
  const { reducedMotion, toggle } = useMotionPreference();
  return (
    <button data-testid="rm-toggle" data-active={reducedMotion ? "1" : "0"} onClick={toggle}>
      toggle
    </button>
  );
};

describe("Reduce-motion E2E", () => {
  beforeEach(() => {
    localStorage.removeItem("reduce-motion");
    document.documentElement.classList.remove("reduce-motion");
  });

  it("adds html.reduce-motion when enabled (global neutralization hook)", () => {
    render(
      <MotionPreferenceProvider>
        <Toggle />
      </MotionPreferenceProvider>
    );
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
    act(() => { screen.getByTestId("rm-toggle").click(); });
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
    expect(localStorage.getItem("reduce-motion")).toBe("1");
  });

  it("persists across reload AND immediately swaps the dashboard video for the poster", () => {
    // Simulate a previous session that enabled the setting.
    localStorage.setItem("reduce-motion", "1");

    render(
      <MemoryRouter>
        <MotionPreferenceProvider>
          <DashboardVideoSection />
        </MotionPreferenceProvider>
      </MemoryRouter>
    );

    // The poster <img> must be present, the <video> must NOT be in the tree.
    const poster = screen.getByAltText(/Aperçu du tableau de bord SchoolHub Pro/i);
    expect(poster.tagName).toBe("IMG");
    expect(document.querySelector("video")).toBeNull();
    // And the global hook is on right away.
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });

  it("when disabled, the <video> element renders (animations active)", () => {
    render(
      <MemoryRouter>
        <MotionPreferenceProvider>
          <DashboardVideoSection />
        </MotionPreferenceProvider>
      </MemoryRouter>
    );
    expect(document.querySelector("video")).not.toBeNull();
  });
});

describe("CSS contract for reduce-motion", () => {
  it("index.css declares the global override selector", async () => {
    const fs = await import("node:fs/promises");
    const css = await fs.readFile("src/index.css", "utf8");
    expect(css).toMatch(/html\.reduce-motion\s+\*/);
    expect(css).toMatch(/animation-duration:\s*0\.001ms/);
    expect(css).toMatch(/transition-duration:\s*0\.001ms/);
  });
});