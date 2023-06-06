import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";


type TokenPayload = {
    id: string;
    iat: number;
    exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "Usuário sem permissão!" });
    }
    const [, token] = authorization.split(" ");

    try {
        const decoded = verify(token, "secret");

        const { id } = decoded as TokenPayload;

        req.headers['userId'];

        //Seguir para rota Users -> Listar usuarios

        next();

    } catch (error) {
        return res.status(401).json({ error: "Token Inválido!" })
    }
}
