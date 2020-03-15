import fs from 'fs';
import { client } from './api/repository';

export const migrate = async () => {
  await client.query(
    'CREATE TABLE IF NOT EXISTS Migrations (Name varchar(255))'
  );

  const finishedMigrations: {
    name: string;
  }[] = await client.query('SELECT Name FROM Migrations').then(x => x.rows);

  const allMigrations = await getMigrations();

  const notRunMigrations = allMigrations
    .filter(([name, _]) => !finishedMigrations.map(x => x.name).includes(name))
    .sort(([name1], [name2]) => (name1 < name2 ? -1 : name2 < name1 ? 1 : 0));

  console.log('Fant følgende migrasjoner:');
  console.log(notRunMigrations);

  notRunMigrations.forEach(async ([name, migration]) => {
    await client.query(migration);
    client.query('INSERT INTO Migrations (Name) VALUES ($1)', [name]);
  });
};

const getMigrations = async (): Promise<string[][]> => {
  const path = './dist/migrations';
  return new Promise(resolve =>
    fs.readdir(path, (err, fileNames) => {
      resolve(
        Promise.all(
          fileNames.map(async fileName => [
            fileName,
            await readFileContent(path + '/' + fileName),
          ])
        )
      );
    })
  );
};

const readFileContent = (fileName: string): Promise<string> => {
  return new Promise(resolve =>
    fs.readFile(fileName, 'utf8', (err, data) => resolve(data))
  );
};
