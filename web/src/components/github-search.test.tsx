import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GithubSearch } from "./github-search";
import { mockFetch, renderWithQuery } from "@/test/utils";

describe("<GithubSearch />", () => {
  it("valida o nome antes de chamar a API", async () => {
    const fetch = mockFetch(() => [200, {}]);
    renderWithQuery(<GithubSearch />);
    await userEvent.type(screen.getByLabelText("Usuário do GitHub"), "-invalido-");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um nome de usuário do GitHub válido");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("mostra o perfil encontrado", async () => {
    const fetch = mockFetch(() => [
      200,
      {
        login: "Douglas-00",
        name: "Douglas Alves",
        bio: "Engenheiro de software",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
        htmlUrl: "https://github.com/Douglas-00",
        location: "São Paulo",
        publicRepos: 1234,
        followers: 10,
        following: 5,
      },
    ]);
    renderWithQuery(<GithubSearch />);
    await userEvent.type(screen.getByLabelText("Usuário do GitHub"), "Douglas-00");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByRole("heading", { name: "Douglas Alves" })).toBeInTheDocument();
    expect(screen.getByText("1.234")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "@Douglas-00" })).toHaveAttribute("href", "https://github.com/Douglas-00");
    expect(fetch.mock.calls[0][0]).toBe("/api/github/Douglas-00");
  });

  it("mostra o erro da API", async () => {
    mockFetch(() => [404, { message: "Usuário não encontrado no GitHub" }]);
    renderWithQuery(<GithubSearch />);
    await userEvent.type(screen.getByLabelText("Usuário do GitHub"), "ninguem");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Usuário não encontrado no GitHub");
  });
});
