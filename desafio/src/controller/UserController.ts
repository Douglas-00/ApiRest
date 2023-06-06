import { Request, Response } from "express";
import { hash } from "bcrypt";
import { prisma } from "../utils/prisma";
import { getUserFromGitHub } from "../utils/github";



export class UserController {

    async index(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    name: true,
                    email: true,
                },
            });

            return res.status(200).json({ users });

        } catch (error) {
            return res.status(500).json({ error: "Erro ao obter usuários." });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    name: true,
                    email: true,
                },
            });

            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: "Usuário não encontrado." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao obter usuário." });
        }
    }


    async store(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;


            switch (true) {
                case !name:
                    res.status(400).json({ message: " O Nome é obrigatório!" });
                    break;
                case !email:
                    res.status(400).json({ message: " O Email é obrigatório!" });
                    break;
                case !password || password.length < 6:
                    res.status(400).json({ message: "Senha é obrigatória e deve ter no mínimo 6 caracteres!" });
                    break;
                default:
                    const userExists = await prisma.user.findUnique({ where: { email } });

                    if (userExists) {
                        return res.status(409).json({ message: "Usuário já cadastrado. Insira credenciais válidas!" });
                    }

                    const hash_password = await hash(password, 8);

                    const user = await prisma.user.create({
                        data: {
                            name,
                            email,
                            password: hash_password,
                        },
                    });

                    return res.status(201).json({ user });
            }

        } catch (error) {
            return res.status(500).json({ error: "Erro ao efetuar Cadastro." });
        }

    }

    async update(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const { name, email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (user) {
                const data: { name?: string; email?: string; password?: string } = {};

                if (name) data.name = name;
                if (email) data.email = email;
                if (password) {
                    const hashedPassword = await hash(password, 8);
                    data.password = hashedPassword;
                }

                const updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: data,
                });

                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ error: "Usuário não encontrado." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao atualizar Usuário." });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);

            const deletedUser = await prisma.user.delete({
                where: { id: userId },
            });

            return res.status(200).json({ message: "Usuário deletado com Sucesso! " });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao Excluir Usuário" });
        }
    }

    //GITHUB
    async getUser(req: Request, res: Response) {

        try {
            const { username } = req.params;

            const githubUser = await getUserFromGitHub(username);
          
            
            if (githubUser) {
                res.status(200).json({ githubUser});
            } 


        } catch (error) {
            res.status(404).json({ error: "Usuário não encontrado no GitHub" });
        }
    }
}
