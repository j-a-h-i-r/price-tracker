// Update with your config settings.
import 'dotenv/config';

export default{
  migrations: {
    extension: 'ts',
  },

  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      extension: 'ts'
    }
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 25
    },
    migrations: {
      extension: 'ts',
    }
  }
};
