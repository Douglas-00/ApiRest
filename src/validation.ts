import { z } from "zod";

const email = z.email({ error: "email deve ser um e-mail válido" }).trim().toLowerCase();
const password = z
  .string({ error: "password deve ser um texto" })
  .min(8, { error: "password deve ter no mínimo 8 caracteres" })
  .max(72, { error: "password deve ter no máximo 72 caracteres" });
const name = z
  .string({ error: "name deve ser um texto" })
  .trim()
  .min(1, { error: "name é obrigatório" })
  .max(100, { error: "name deve ter no máximo 100 caracteres" });

export const signUpSchema = z.strictObject({ name, email, password }, { error: "Campo não permitido" });

export const loginSchema = z.object({
  email: z.string({ error: "email é obrigatório" }).trim().toLowerCase(),
  password: z.string({ error: "password é obrigatório" }),
});

export const updateMeSchema = z
  .strictObject({ name: name.optional(), email: email.optional(), password: password.optional() })
  .refine((v) => Object.keys(v).length > 0, { error: "Informe ao menos um campo para atualizar" });

export const idParam = z.coerce
  .number({ error: "O identificador deve ser um número inteiro" })
  .int({ error: "O identificador deve ser um número inteiro" })
  .positive({ error: "O identificador deve ser um número inteiro" });

/** GitHub rules: 1–39 chars, alphanumeric or single hyphens, not at the ends. */
export const githubUsername = z
  .string()
  .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, { error: "Nome de usuário do GitHub inválido" });
