import { Client } from 'pg';
import { connectionString } from '../settings';

const client = new Client({
  connectionString,
});
client.connect();

export async function migrateV1() {
  const initTable = `
        CREATE TABLE "person" (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(255)
        );
    `;
  return await client.query(initTable);
}

export async function selectNow() {
  const date = await client.query('SELECT NOW()');
  return date.rows[0];
}

export async function createUser(name: string) {
  const text = 'INSERT INTO person (name) VALUES($1) RETURNING *';
  const values = [name];
  const sqlRes = await client.query(text, values);
  console.log(sqlRes);
  return sqlRes.rows[0];
}

export async function getUser(id: number) {
  const text = 'SELECT * FROM person WHERE id = $1';
  const values = [id];
  const sqlRes = await client.query(text, values);
  console.log(sqlRes);
  return sqlRes.rows;
}
