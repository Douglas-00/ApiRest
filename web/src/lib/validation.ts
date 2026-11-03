const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const isEmail = (value: string) => EMAIL.test(value.trim());

export function validateSignUp(input: { name: string; email: string; password: string }): string | null {
  if (!input.name.trim()) return "Informe seu nome";
  if (!isEmail(input.email)) return "Informe um e-mail válido";
  if (input.password.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  if (input.password.length > 72) return "A senha deve ter no máximo 72 caracteres";
  return null;
}

/** Mesmas regras da API: arquivo não vazio, até 5 MB. */
export function validateFile(file: File): string | null {
  if (file.size === 0) return `"${file.name}" está vazio`;
  if (file.size > MAX_FILE_BYTES) return `"${file.name}" tem mais de 5 MB`;
  return null;
}

/** Regras de nome de usuário do GitHub. */
export const isGithubUsername = (value: string) => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value.trim());
