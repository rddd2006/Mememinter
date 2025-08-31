// backend/db.js
const { Pool } = require('pg');

// Start with the base configuration using the connection string
const config = {
  connectionString: process.env.POSTGRES_URL,
};

// Only add the SSL configuration if we are NOT connecting to a local database.
// Vercel Postgres URLs do not contain "localhost".
if (process.env.POSTGRES_URL && !process.env.POSTGRES_URL.includes("localhost")) {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(config);

module.exports = {
  query: (text, params) => pool.query(text, params),
};