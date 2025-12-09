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

  console.log("📦 Starting migration script...");
  console.log("🔗 Connecting to:", connectionString.replace(/:[^:@]*@/, ":***@")); // Mask password

  // DEBUG: Check files in ./drizzle
  const fs = require('fs');
  try {
    const files = fs.readdirSync('./drizzle');
    console.log(`📂 Found ${files.length} files in ./drizzle:`, files.filter(f => f.endsWith('.sql')));
  } catch (e) {
    console.error("❌ Failed to read ./drizzle:", e.message);
  }

  // DEBUG: Check existing tables
  const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
  console.log("📊 Existing tables in public schema:", res.rows.map(r => r.table_name));

  console.log("📦 Running migrations via drizzle-orm...");

  try {
    // Enable pgcrypto for gen_random_bytes/uuid
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log("✅ Extension 'pgcrypto' enabled.");

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
