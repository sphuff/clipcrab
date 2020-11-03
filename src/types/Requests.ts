import { Request } from 'express';

export interface UserRequest extends Request {
    user: any;
    logIn: Function;
    userEntity: any;
    session: any;
    logout: Function;
    body: any;
}

export interface FileRequest extends Request {
    files: any;
    body: any;
}