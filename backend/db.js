// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  // This connection string will be provided by Vercel in the deployment environment.
  connectionString: process.env.POSTGRES_URL, 
  ssl: {
    rejectUnauthorized: false // This is required to connect to Vercel Postgres.
  }
});

module.exports = {
  // We export a query function that uses the connection pool.
  query: (text, params) => pool.query(text, params),
};