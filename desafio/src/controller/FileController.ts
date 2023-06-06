import { Request, Response } from "express";
const fs = require('fs');
const path = require('path');
import multer from 'multer';
import { prisma } from "../utils/prisma";


export class FileController {
    async upload(req: Request, res: Response) {

        const file = req.file;

        if (!file) {
            return res.status(400).json('Nenhum arquivo enviado.');
        }
        const verifyFile = file.size;
        if (verifyFile < 1024 || verifyFile > 5 * 1024 * 1024) {
            return res.status(400).json('Tamanho de arquivo inválido. O arquivo deve ter entre 1KB e 5MB.');
        }
        const extensaoArquivo = file.originalname.split('.')[1];
        const fileName = `${file.originalname}.${extensaoArquivo}`;
        
        try {
            const savedFile = await prisma.file.create({
                data: {
                    filename: fileName,
                    path: file.path
                }
            });

            return res.status(201).json('Upload bem-sucedido!');

        } catch (error) {
            return res.status(500).json({ error: "Erro ao efetuar Upload do Arquivo." });
        }
    }
   

    async download(req: Request, res: Response) {
        
        const fileId = parseInt(req.params.fileId);

        try {
          const file = await prisma.file.findUnique({
            where: {
              id: fileId,
            },
          });
      
          if (!file) {
            res.status(404).json({ error: 'Arquivo não encontrado.' });
            return;
          }
      
          const filePath = path.join(__dirname, 'uploads', file.filename);
      
          const fileExists = fs.existsSync(filePath);
      
          if (fileExists) {
            res.download(filePath, file.filename, (err) => {
              if (err) {
                console.error('Erro ao fazer download do arquivo:', err);
                res.status(500).json({ error: 'Erro ao fazer download do arquivo.' });
              }
            });
          } else {
            res.status(404).json({ error: 'Arquivo não encontrado.' });
          }
        } catch (err) {
          console.error('Erro ao buscar informações do arquivo:', err);
          res.status(500).json({ error: 'Erro ao buscar informações do arquivo.' });
        }
      
    }
}