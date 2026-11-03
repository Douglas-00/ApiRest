import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";

const prisma = new PrismaClient();
const config = loadConfig();
const githubFetch = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
const app = createApp({ prisma, config, fetch: githubFetch as unknown as typeof fetch });

const signUp = async (email = "ana@exemplo.com", password = "senha-forte-123") => {
  await request(app).post("/users").send({ name: "Ana", email, password }).expect(201);
  const res = await request(app).post("/auth/login").send({ email, password }).expect(200);
  return `Bearer ${res.body.token}`;
};
const storedFiles = () => (fs.existsSync(config.uploadDir) ? fs.readdirSync(config.uploadDir) : []);

beforeEach(async () => {
  await prisma.file.deleteMany();
  await prisma.user.deleteMany();
  fs.rmSync(config.uploadDir, { recursive: true, force: true });
  fs.mkdirSync(config.uploadDir, { recursive: true });
  githubFetch.mockReset();
});
afterAll(() => prisma.$disconnect());

it("GET /health", () => request(app).get("/health").expect(200, { status: "ok" }));

it("unknown routes return 404 in Portuguese", () =>
  request(app).get("/create").expect(404, { statusCode: 404, message: "Rota não encontrada" }));

describe("users and auth", () => {
  it("signs up without returning the password hash (the old API did)", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: " Ana ", email: "ANA@Exemplo.com", password: "senha-forte-123" })
      .expect(201);
    expect(res.body).toEqual({ id: expect.any(Number), name: "Ana", email: "ana@exemplo.com", created_at: expect.any(String) });
    await request(app).post("/users").send({ name: "Outra", email: "ana@exemplo.com", password: "senha-forte-123" }).expect(409, {
      statusCode: 409,
      message: "E-mail já cadastrado",
    });
  });

  it("validates input with Portuguese messages", async () => {
    const res = await request(app).post("/users").send({ name: "", email: "x", password: "123", admin: true }).expect(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        "name: name é obrigatório",
        "email: email deve ser um e-mail válido",
        "password: password deve ter no mínimo 8 caracteres",
      ]),
    );
    await request(app).post("/users").set("content-type", "application/json").send("{bad").expect(400, {
      statusCode: 400,
      message: "JSON inválido",
    });
  });

  it("uses the same answer for unknown e-mail and wrong password", async () => {
    await signUp();
    const wrong = await request(app).post("/auth/login").send({ email: "ana@exemplo.com", password: "errada" }).expect(401);
    const unknown = await request(app).post("/auth/login").send({ email: "nao@existe.com", password: "errada" }).expect(401);
    expect(wrong.body).toEqual(unknown.body);
    expect(unknown.body.message).toBe("E-mail ou senha inválidos");
  });

  it("protects user routes and only allows changing your own account", async () => {
    await request(app).get("/users").expect(401, { statusCode: 401, message: "Token de acesso não informado" });
    await request(app).get("/users/me").set("Authorization", "Bearer x.y.z").expect(401);
    // The old PUT/DELETE /users/id/:id had no authentication at all.
    await request(app).delete("/users/id/1").expect(404);

    const auth = await signUp();
    const me = await request(app).put("/users/me").set("Authorization", auth).send({ name: "Ana Souza", password: "nova-senha-123" }).expect(200);
    expect(me.body).toMatchObject({ name: "Ana Souza", email: "ana@exemplo.com" });
    await request(app).post("/auth/login").send({ email: "ana@exemplo.com", password: "nova-senha-123" }).expect(200);
    await request(app).put("/users/me").set("Authorization", auth).send({}).expect(400);
  });

  it("lists users for authenticated callers without sensitive fields", async () => {
    const auth = await signUp();
    await signUp("bob@exemplo.com");
    const res = await request(app).get("/users").set("Authorization", auth).expect(200);
    expect(res.body.map((u: { email: string }) => u.email)).toEqual(["ana@exemplo.com", "bob@exemplo.com"]);
    expect(res.body[0]).not.toHaveProperty("password");
  });
});

describe("files", () => {
  it("uploads, lists and downloads the same bytes (regression: download always 404'd)", async () => {
    const auth = await signUp();
    const content = Buffer.from("conteúdo do relatório");
    const up = await request(app)
      .post("/files")
      .set("Authorization", auth)
      .attach("file", content, { filename: "relatório final.txt", contentType: "text/plain" })
      .expect(201);
    expect(up.body).toMatchObject({ originalName: "relatório final.txt", size: content.length, mimeType: "text/plain" });

    const list = await request(app).get("/files").set("Authorization", auth).expect(200);
    expect(list.body).toHaveLength(1);

    const down = await request(app)
      .get(`/files/${up.body.id}/download`)
      .set("Authorization", auth)
      .buffer(true)
      .parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => cb(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(Buffer.compare(down.body as Buffer, content)).toBe(0);
    expect(down.headers["content-disposition"]).toContain("relat%C3%B3rio%20final.txt");
    expect(down.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("never uses the client filename as a path", async () => {
    const auth = await signUp();
    const up = await request(app).post("/files").set("Authorization", auth).attach("file", Buffer.from("x"), "../../evil.sh").expect(201);
    expect(up.body.originalName).toBe("evil.sh");
    expect(storedFiles()).toHaveLength(1);
    expect(storedFiles()[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(fs.existsSync(path.join(config.uploadDir, "..", "..", "evil.sh"))).toBe(false);
  });

  it("enforces size limits and rejects empty files", async () => {
    const auth = await signUp();
    await request(app).post("/files").set("Authorization", auth).attach("file", Buffer.alloc(65 * 1024), "big.bin").expect(413);
    await request(app).post("/files").set("Authorization", auth).attach("file", Buffer.alloc(0), "empty.txt").expect(400, {
      statusCode: 400,
      message: "O arquivo está vazio",
    });
    await request(app).post("/files").set("Authorization", auth).expect(400);
    expect(storedFiles()).toHaveLength(0);
  });

  it("isolates files between users", async () => {
    const ana = await signUp("ana@exemplo.com");
    const bob = await signUp("bob@exemplo.com");
    const up = await request(app).post("/files").set("Authorization", ana).attach("file", Buffer.from("segredo"), "a.txt").expect(201);

    await request(app).get("/files").set("Authorization", bob).expect(200, []);
    await request(app).get(`/files/${up.body.id}/download`).set("Authorization", bob).expect(404);
    await request(app).delete(`/files/${up.body.id}`).set("Authorization", bob).expect(404);
    await request(app).get("/files/abc/download").set("Authorization", ana).expect(400);
  });

  it("deletes the database row and the blob on disk", async () => {
    const auth = await signUp();
    const up = await request(app).post("/files").set("Authorization", auth).attach("file", Buffer.from("x"), "a.txt").expect(201);
    await request(app).delete(`/files/${up.body.id}`).set("Authorization", auth).expect(200);
    expect(storedFiles()).toHaveLength(0);
  });

  it("deleting the account removes its files", async () => {
    const auth = await signUp();
    await request(app).post("/files").set("Authorization", auth).attach("file", Buffer.from("x"), "a.txt").expect(201);
    await request(app).delete("/users/me").set("Authorization", auth).expect(200);
    expect(await prisma.file.count()).toBe(0);
    expect(storedFiles()).toHaveLength(0);
  });
});

describe("GitHub lookup", () => {
  const ghUser = {
    login: "Douglas-00",
    name: "Douglas Alves",
    bio: null,
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    html_url: "https://github.com/Douglas-00",
    location: "São Paulo",
    public_repos: 20,
    followers: 10,
    following: 5,
  };
  const respond = (status: number, body: unknown = {}) =>
    githubFetch.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

  it("maps the profile and caches repeated lookups", async () => {
    respond(200, ghUser);
    const first = await request(app).get("/github/Douglas-00").expect(200);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(first.body).toEqual({
      login: "Douglas-00",
      name: "Douglas Alves",
      bio: null,
      avatarUrl: ghUser.avatar_url,
      htmlUrl: ghUser.html_url,
      location: "São Paulo",
      publicRepos: 20,
      followers: 10,
      following: 5,
    });
    const second = await request(app).get("/github/douglas-00").expect(200);
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(githubFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    [404, 404, "Usuário não encontrado no GitHub"],
    [403, 503, "Limite de requisições do GitHub atingido, tente mais tarde"],
    [500, 502, "Não foi possível consultar o GitHub"],
  ])("GitHub %i → %i", async (upstream, status, message) => {
    respond(upstream);
    await request(app).get(`/github/user-${upstream}`).expect(status, { statusCode: status, message });
  });

  it("rejects invalid usernames without calling GitHub", async () => {
    const res = await request(app).get("/github/-invalid-").expect(400);
    expect(res.body.message).toEqual(["Nome de usuário do GitHub inválido"]);
    expect(githubFetch).not.toHaveBeenCalled();
  });
});
