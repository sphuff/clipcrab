import { Request } from 'express';

export interface UserRequest extends Request {
    user: any;
}

export interface FileRequest extends Request {
    files: any;
}