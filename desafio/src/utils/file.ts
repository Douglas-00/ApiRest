declare module 'multer' {
    import { Request } from 'express';
  
    interface File extends Express.Multer.File {}
  
    interface Multer {
      (options?: any): any;
      single(fieldname: string): any;

      id:string,
    }
  
    interface MulterRequest extends Request {
      file: any;
      files: File[];
    }
  
    function multer(options?: any): Multer;
  
    namespace multer {
      export function single(fieldname: string): any;
    }
  
    export = multer;
  }