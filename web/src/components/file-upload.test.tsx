import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "./file-upload";
import { renderWithQuery } from "@/test/utils";
import { vi } from "vitest";

describe("<FileUpload />", () => {
  it("envia arquivos válidos como multipart e ignora os inválidos", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({ id: 1, originalName: "ok.txt", mimeType: "text/plain", size: 2, createdAt: "2026-01-01T00:00:00Z" }, { status: 201 }),
    );
    renderWithQuery(<FileUpload />);
    await userEvent.upload(screen.getByLabelText("Escolher arquivos"), [
      new File(["oi"], "ok.txt", { type: "text/plain" }),
      new File([], "vazio.txt"),
    ]);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent('"ok.txt" enviado'));
    expect(screen.getByRole("alert")).toHaveTextContent('"vazio.txt" está vazio');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/files");
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toHaveProperty("name", "ok.txt");
    // No manual content-type: the browser must set the multipart boundary.
    expect(init?.headers).toBeUndefined();
  });

  it("mostra o erro da API por arquivo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ message: "O arquivo deve ter no máximo 5 MB" }, { status: 413 }));
    renderWithQuery(<FileUpload />);
    await userEvent.upload(screen.getByLabelText("Escolher arquivos"), new File(["x"], "a.bin"));
    expect(await screen.findByRole("alert")).toHaveTextContent("a.bin: O arquivo deve ter no máximo 5 MB");
  });
});
