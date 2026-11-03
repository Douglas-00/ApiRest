import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = () => {
  throw new HttpError(404, "Rota não encontrada");
};

/** Every error leaves the API as { statusCode, message } in Portuguese. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      error: "Requisição inválida",
      message: err.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message)),
    });
    return;
  }
  if (err instanceof MulterError) {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    res.status(tooLarge ? 413 : 400).json({
      statusCode: tooLarge ? 413 : 400,
      message: tooLarge ? "O arquivo deve ter no máximo 5 MB" : "Envie um único arquivo no campo \"file\"",
    });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ statusCode: 409, message: "E-mail já cadastrado" });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ statusCode: 400, message: "JSON inválido" });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ statusCode: err.status, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ statusCode: 500, message: "Erro interno do servidor" });
};
