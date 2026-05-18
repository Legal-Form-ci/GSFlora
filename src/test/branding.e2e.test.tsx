import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Logo from "@/components/Logo";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { startBrandingGuard } from "@/lib/brandingGuard";

describe("Branding E2E (DOM-level)", () => {
  it("Logo renders the SchoolHub Pro asset (never logo-flora)", () => {
    render(<Logo />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("alt") || "").toMatch(/SchoolHub Pro/);
    expect(img.src).not.toMatch(/logo-flora/i);
  });

  it("CTA section exposes all 4 role CTAs", () => {
    render(<MemoryRouter><CTASection /></MemoryRouter>);
    for (const role of ["Fondateur", "Enseignants", "Élèves", "Parents"]) {
      expect(screen.getByText(role)).toBeInTheDocument();
    }
  });

  it("Footer carries the SchoolHub Pro branding", () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getAllByText(/SchoolHub Pro/i).length).toBeGreaterThan(0);
  });
});

describe("Runtime branding guard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("rewrites a stray legacy logo image", async () => {
    const img = document.createElement("img");
    img.src = "/logo-flora.png";
    document.body.appendChild(img);
    startBrandingGuard();
    // sweep runs synchronously on start
    expect(img.src).not.toMatch(/logo-flora/);
    expect(img.alt).toMatch(/SchoolHub Pro/);
  });

  it("rewrites legacy brand name in text nodes", () => {
    const div = document.createElement("div");
    div.textContent = "Bienvenue chez GS Flora";
    document.body.appendChild(div);
    startBrandingGuard();
    expect(div.textContent).toBe("Bienvenue chez SchoolHub Pro");
  });
});