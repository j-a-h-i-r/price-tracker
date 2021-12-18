// Update with your config settings.
require("dotenv").config();

module.exports = {

  migrations: {
    extension: "ts",
  },

  development: {
    client: "postgresql",
    connection: process.env.DB_URL,

  },

  staging: {
    client: "postgresql",
    connection: process.env.DB_URL,
    pool: {
      min: 2,
      max: 10
    },
  },

};
