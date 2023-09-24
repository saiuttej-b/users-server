import { NextFunction, Request, Response } from 'express';
import { User } from 'src/domain/schemas/user.schema';
import { get, set, store } from './request-store-config';

export const EXPRESS_REQUEST = 'EXPRESS_REQUEST';
export const CURRENT_USER = 'CURRENT_USER';

export const storeMiddleWare = (req: Request, _res: Response, next: NextFunction) => {
  store.run(new Map(), () => {
    setExpressRequest(req);
    return next();
  });
};

export const storeSession = async <T>(session: () => Promise<T>) => {
  return new Promise<T>((resolve, reject) => {
    store.run(new Map(), async () => {
      try {
        const res = await session();
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export function setExpressRequest(req: Request): void {
  set(EXPRESS_REQUEST, req);
}

export function getExpressRequest(): any {
  return get(EXPRESS_REQUEST);
}

export function setUser(data: User) {
  set(CURRENT_USER, data);
}

export function getUser() {
  return get<User>(CURRENT_USER);
}
