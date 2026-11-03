import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fileLabel, FilesList } from "./files-list";
import { mockFetch, renderWithQuery } from "@/test/utils";

const files = [
  { id: 7, originalName: "relatório.pdf", mimeType: "application/pdf", size: 2048, createdAt: "2026-01-01T10:00:00Z" },
  { id: 8, originalName: "foto.png", mimeType: "image/png", size: 1024, createdAt: "2026-01-02T10:00:00Z" },
];

describe("<FilesList />", () => {
  it("lista com total e link de download pelo BFF", async () => {
    mockFetch(() => [200, files]);
    renderWithQuery(<FilesList />);
    expect(screen.getByLabelText("Carregando arquivos")).toBeInTheDocument();
    expect(await screen.findByText("2 arquivos · 3 KB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Baixar relatório.pdf" })).toHaveAttribute("href", "/api/files/7/download");
  });

  it("mostra o estado vazio", async () => {
    mockFetch(() => [200, []]);
    renderWithQuery(<FilesList />);
    expect(await screen.findByText("Nenhum arquivo ainda")).toBeInTheDocument();
  });

  it("exclui só após confirmar", async () => {
    const fetch = mockFetch((method) => (method === "DELETE" ? [200, { message: "ok" }] : [200, files]));
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderWithQuery(<FilesList />);
    const button = await screen.findByRole("button", { name: "Excluir foto.png" });
    await userEvent.click(button);
    expect(fetch).not.toHaveBeenCalledWith("/api/files/8", expect.anything());
    await userEvent.click(button);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/files/8", expect.objectContaining({ method: "DELETE" })));
  });
});

describe("fileLabel", () => {
  it.each([
    ["relatório.pdf", "PDF"],
    ["foto.jpeg", "JPEG"],
    ["arquivo.compressed", "COMP"],
    ["Makefile", "ARQ"],
  ])("%s → %s", (name, label) => expect(fileLabel(name)).toBe(label));
});
