import pg from "pg";

const { Client } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
        CREATE TYPE category AS ENUM ('climate', 'economic', 'supply_chain');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');
      END IF;
    END
    $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS risk_events (
      id SERIAL PRIMARY KEY,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      category category NOT NULL,
      risk_score REAL NOT NULL,
      risk_level risk_level NOT NULL,
      source TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      source TEXT NOT NULL,
      country TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("schema-ok");
  console.log(result.rows.map((row) => row.table_name).join(", "));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
