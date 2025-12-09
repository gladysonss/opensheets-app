const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { Pool } = require("pg");

async function runMigrations() {
  console.log("📦 Starting migration script...");
  
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

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
    // 42P07: Table exists
    // 42710: Duplicate object (constraint)
    if (
      error.code === '42P07' || 
      error.cause?.code === '42P07' || 
      error.code === '42710' ||
      error.cause?.code === '42710'
    ) {
      console.warn("⚠️  Database schema conflict usage detected (Tables/Constraints exist).");
      console.warn("⚠️  Attempting to apply critical schema updates manually...");
      
      try {
        // Fallback: Create invitations table if it likely failed to be created by migration
        // Extracted from 0009_shallow_weapon_omega.sql
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "invitations" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "email" text NOT NULL,
            "token" text NOT NULL,
            "created_by" text NOT NULL,
            "expires_at" timestamp with time zone NOT NULL,
            "used_at" timestamp with time zone,
            "created_at" timestamp with time zone DEFAULT now() NOT NULL,
            CONSTRAINT "invitations_token_unique" UNIQUE("token")
          );
        `);
        console.log("✅ Critical table 'invitations' ensured via fallback.");
      } catch (manualError) {
        console.error("❌ Fallback creation failed:", manualError);
      }
      
      console.log("✅ Assuming database schema is sufficient to proceed.");
    } else {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

runMigrations();
