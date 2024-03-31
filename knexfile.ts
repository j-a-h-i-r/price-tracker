// Update with your config settings.
require("dotenv").config();

module.exports = {

  migrations: {
    extension: "ts",
  },

  development: {
    client: "postgresql",
    connection: "postgresql://localhost:5432/gpu_prices_dump",
    migrations: {
      extension: "ts"
    }
  },

  staging: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 25
    },
    migrations: {
      extension: "js",
    }
  }

};
