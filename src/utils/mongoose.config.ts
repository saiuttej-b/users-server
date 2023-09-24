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
