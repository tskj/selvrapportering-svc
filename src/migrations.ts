import { client } from './api/repository';

export const migrate = async () => {
  await client.query(
    'CREATE TABLE IF NOT EXISTS Migrations (Name varchar(255))'
  );

  const finishedMigrations: {
    name: string;
  }[] = await client.query('SELECT Name FROM Migrations').then(x => x.rows);

  const allMigrations = getMigrations();

  const notRunMigrations = allMigrations.filter(
    ([name, _]) => !finishedMigrations.map(x => x.name).includes(name)
  );

  notRunMigrations.forEach(async ([name, migration]) => {
    await client.query(migration);
    client.query('INSERT INTO Migrations (Name) VALUES ($1)', [name]);
  });
};

const getMigrations = () => {
  return [
    [
      '0001-create-person-table.sql',
      `
        CREATE TABLE "person" (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(255)
        );
  `,
    ],
  ];
};
