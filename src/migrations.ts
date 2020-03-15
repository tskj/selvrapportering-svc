import fs from 'fs';
import { client } from './api/repository';

interface File {
  name: string;
  content: string;
}

export const migrate = async () => {
  await client.query(
    'CREATE TABLE IF NOT EXISTS Migrations (Name varchar(255))',
  );

  const finishedMigrations: {
    name: string;
  }[] = await client.query('SELECT Name FROM Migrations').then(x => x.rows);

  const allMigrations = await getMigrations();

  const notRunMigrations = allMigrations
    .filter(({ name }) => !finishedMigrations.map(x => x.name).includes(name))
    .sort(({ name: name1 }, { name: name2 }) =>
      name1.localeCompare(name2, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );

  console.log('Fant følgende migrasjoner:');
  console.log(notRunMigrations);

  notRunMigrations.forEach(async ({ name, content: migration }) => {
    await client.query(migration);
    client.query('INSERT INTO Migrations (Name) VALUES ($1)', [name]);
  });
};

const getMigrations = async (): Promise<File[]> => {
  const path = './dist/migrations';
  return new Promise(resolve =>
    fs.readdir(path, (err, fileNames) => {
      resolve(
        Promise.all(
          fileNames.map(async fileName => ({
            name: fileName,
            content: await readFileContent(path + '/' + fileName),
          })),
        ),
      );
    }),
  );
};

const readFileContent = (fileName: string): Promise<string> => {
  return new Promise(resolve =>
    fs.readFile(fileName, 'utf8', (err, data) => resolve(data)),
  );
};
