const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { Pool } = require("pg");

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  // Disable SSL for local connections (optional logic, but usually needed for production RDS/Neon/Supabase)
  // Adjust ssl config based on your provider requirements if needed
  const pool = new Pool({
    connectionString,
    // Add ssl: true if your provider requires it (common for Neon/Supabase/Render)
    // ssl: { rejectUnauthorized: false } 
  });

  const db = drizzle(pool);

  console.log("📦 Running migrations via drizzle-orm...");

  try {
    // Run migrations from ./drizzle folder
    // Note: In the Docker container, we copy /drizzle to /app/drizzle, so relative path works
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    if (error.code === '42P07' || error.cause?.code === '42P07') {
      console.warn("⚠️  Tables already exist (likely created via db:push previously). Skipping migrations to avoid data loss.");
      console.warn("✅ Assuming database schema is up to date.");
    } else {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

runMigrations();
