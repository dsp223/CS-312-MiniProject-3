require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool();

module.exports = pool;

// testing the database connection
if (require.main === module) {
  pool
    .query("SELECT COUNT(*) AS total FROM public.blogs")
    .then((result) => {
      console.log("Connected to BlogDB!");
      console.log("Blog posts:", result.rows[0].total);
    })
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
