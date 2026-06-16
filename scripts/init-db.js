const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'personal_blog';

const escapeIdentifier = (identifier) => `\`${String(identifier).replace(/`/g, '``')}\``;

const splitSqlStatements = (sql) => sql
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(dbName)} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE ${escapeIdentifier(dbName)}`);

    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    const statements = splitSqlStatements(schemaSql);

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log(`Database ${dbName} initialized successfully.`);
  } finally {
    await connection.end();
  }
};

initDatabase().catch((error) => {
  console.error('Failed to initialize database:', error.message);

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Please check DB_USER and DB_PASSWORD in your .env file.');
  }

  process.exit(1);
});