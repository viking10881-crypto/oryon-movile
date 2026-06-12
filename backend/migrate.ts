import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Conectando a Neon DB...');
    const sql = readFileSync(join(__dirname, 'src', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✓ Tablas creadas exitosamente en Neon DB');

    const tables = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    console.log('\nTablas en la base de datos:');
    tables.rows.forEach(r => console.log('  -', r.tablename));
  } catch (err) {
    console.error('Error al migrar:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
