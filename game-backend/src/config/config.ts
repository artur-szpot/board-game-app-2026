export default () => {
  const mode = process.env.NODE_ENV ?? 'development';
  return mode === 'development'
    ? {
        port: 3001,
        authSecret: 'fake-dev-secret',
        database: {
          host: 'db',
          port: 5432,
          name: 'name',
          user: 'user',
          password: 'password',
        },
      }
    : {
        port: parseInt(process.env.APP_PORT, 10) || 3001,
        authSecret: process.env.AUTH_SECRET,
        database: {
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
          name: process.env.DATABASE_NAME,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        },
      };
};
