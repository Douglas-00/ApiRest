import { Router } from "express";
import { HttpError } from "../errors";
import { githubUsername } from "../validation";
import type { Config } from "../config";

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

/** Subset of https://docs.github.com/rest/users/users#get-a-user */
interface GithubApiUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

type Fetch = typeof fetch;
const TTL_MS = 5 * 60_000;
const MAX_ENTRIES = 500;

/**
 * Proxy to the GitHub users API with a small TTL cache: the unauthenticated
 * limit is 60 requests/hour per IP, so repeated lookups must not spend it.
 */
export function githubRoutes(config: Config, fetchImpl: Fetch = fetch) {
  const router = Router();
  const cache = new Map<string, { at: number; profile: GithubProfile }>();

  router.get("/:username", async (req, res) => {
    const username = githubUsername.parse(req.params.username).toLowerCase();
    const hit = cache.get(username);
    if (hit && Date.now() - hit.at < TTL_MS) {
      res.setHeader("X-Cache", "HIT").json(hit.profile);
      return;
    }

    const response = await fetchImpl(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "files-api-portfolio",
        ...(config.githubToken ? { Authorization: `Bearer ${config.githubToken}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      throw new HttpError(502, "Não foi possível consultar o GitHub");
    });

    if (response.status === 404) throw new HttpError(404, "Usuário não encontrado no GitHub");
    if (response.status === 403 || response.status === 429) {
      throw new HttpError(503, "Limite de requisições do GitHub atingido, tente mais tarde");
    }
    if (!response.ok) throw new HttpError(502, "Não foi possível consultar o GitHub");

    const data = (await response.json()) as GithubApiUser;
    const profile: GithubProfile = {
      login: data.login,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      location: data.location,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
    };
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
    cache.set(username, { at: Date.now(), profile });
    res.setHeader("X-Cache", "MISS").json(profile);
  });

  return router;
}
