import { Router } from 'express';
import multer from 'multer';
import { UserController } from './controller/UserController';
import { AuthController } from './controller/AuthController';
import { FileController } from './controller/FileController';
import { authMiddleware } from './middleware/auth';

const usercontroller = new UserController();
const authcontroller = new AuthController();
const filecontroller = new FileController();

export const router = Router();
const upload = multer({ dest: 'uploads/' });



router.post('/create', usercontroller.store);
router.post('/auth', authcontroller.authenticate);
//listar usuarios apenas atutenticado
router.get('/users', authMiddleware, usercontroller.index);
//listar usuario pelo id
router.get('/users/id/:id', usercontroller.getUserById);
//Update usuario pelo id
router.put('/users/id/:id', usercontroller.update);
//delete usuario pelo id
router.delete('/users/id/:id', usercontroller.delete);

//Trazer Dados Github do Usuário que for solicitado na URL
router.get('/users/:username', usercontroller.getUser);

//Efetuar o upload e Download File
router.post('/files/upload', upload.single('file'), filecontroller.upload);

router.get('/files/download/:fileId', filecontroller.download);



