import type { Credentials, GithubProfile, SignUpInput, StoredFile, UpdateMeInput, User } from "./types";

/** O navegador fala só com o BFF em /api; o JWT fica num cookie httpOnly. */
const BASE = "/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // FormData sets its own multipart boundary.
    headers: isForm ? init?.headers : { "content-type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(body, `Falha na requisição (${res.status})`));
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const downloadUrl = (id: number) => `${BASE}/files/${id}/download`;

export const api = {
  login: (input: Credentials) => request<{ ok: true }>("/auth/login", json("POST", input)),
  register: (input: SignUpInput) => request<{ ok: true }>("/auth/register", json("POST", input)),
  logout: () => request<{ ok: true }>("/auth/logout", json("POST")),
  me: () => request<User>("/users/me"),
  updateMe: (input: UpdateMeInput) => request<User>("/users/me", json("PUT", input)),
  deleteMe: () => request<{ message: string }>("/users/me", json("DELETE")),
  listUsers: () => request<User[]>("/users"),
  listFiles: () => request<StoredFile[]>("/files"),
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<StoredFile>("/files", { method: "POST", body: form });
  },
  deleteFile: (id: number) => request<{ message: string }>(`/files/${id}`, json("DELETE")),
  github: (username: string) => request<GithubProfile>(`/github/${encodeURIComponent(username)}`),
};
