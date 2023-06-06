import { Request, Response } from "express";
import { compare } from "bcrypt";
import { prisma } from "../utils/prisma";
import { sign } from "jsonwebtoken";


export class AuthController {

    async authenticate(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return res.status(400).json({ message: "Usuário não encontrado, Insira um e-mail válido" })
            }


            const hashedPassword = await compare(password, user!.password);

            if (!hashedPassword) {
                return res.status(400).json({ message: "Senha Inválida, Insira uma senha válida" });
            }

            const token = sign({ id: user!.id }, "secret", { expiresIn: "1d" });

            const id = user!.id;

            return res.status(200).json({ user: { id, email }, token });

        } catch (error) {

            return res.status(500).json({ error: "Não foi possivel efetuar login" })
        }

    }
}