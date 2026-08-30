async function migrate() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(databaseUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS user_app_states (
      user_id TEXT PRIMARY KEY,
      state JSONB NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('user_app_states schema is ready');
}

migrate().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});

