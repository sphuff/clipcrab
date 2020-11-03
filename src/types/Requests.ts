import { Request } from 'express';

export interface UserRequest extends Request {
    user: any;
    logIn: Function;
    userEntity: any;
    session: any;
    logout: Function;
}

export interface FileRequest extends Request {
    files: any;
}