import { HydratedDocument } from 'mongoose';

export const mongoConfig = () => {
  const username = encodeURIComponent(process.env.MONGO_DB_USERNAME);
  const password = encodeURIComponent(process.env.MONGO_DB_PASSWORD);
  const DB_NAME = process.env.MONGO_DB_DATABASE;
  const DB_HOST = process.env.MONGO_DB_HOST;
  const AUTH = `${username}:${password}`;
  const DB = `${DB_HOST}/${DB_NAME}`;
  const MONGO_URI = `mongodb+srv://${AUTH}@${DB}?retryWrites=true&w=majority`;

  return {
    MONGO_URI,
  };
};

export type EditOptions = {
  updatedById?: string;
};

export function convertDoc<T>(
  fn: () => T,
  value: HydratedDocument<T> | Array<HydratedDocument<T>>,
): T | T[] {
  if (!value) return;
  if (Array.isArray(value)) return value.map((v) => convertSingleDoc(fn, v));

  return convertSingleDoc(fn, value);
}

function convertSingleDoc<T>(fn: () => T, value: HydratedDocument<T>): T {
  if (!value) return;

  const res = fn();
  Object.assign(res, value.toJSON());

  delete res['_id'];
  delete res['__v'];

  return res;
}

export function formatDoc<T>(fn: () => T, value: unknown): T {
  if (!value) return;

  const res = fn();
  Object.assign(res, value);

  delete res['_id'];
  delete res['__v'];

  return res;
}
