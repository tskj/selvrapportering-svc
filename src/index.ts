import './extension-methods/array';
import express from 'express';
import jwt from 'express-jwt-jwks';
import guard from 'express-jwt-permissions';
import cors from 'cors';
import {
  issuer,
  permissionsProperty,
  adminPermission,
  basePath,
} from './settings';
import { createUser, getUser, selectNow } from './api/repository';
import { migrate } from './migrations';

const app = express();
const subpath = express();
const port = process.env.PORT || 6789;

migrate();

app.use(express.json());
app.use(cors());

const openEndpoints = [new RegExp(basePath + '.*'), basePath + '/health'];
app.use(
  jwt({
    jwks: issuer,
  }).unless({
    path: openEndpoints,
  })
);
app.use(
  (guard({ permissionsProperty }).check(adminPermission) as any).unless({
    path: openEndpoints,
  })
);

app.use(basePath, subpath);

subpath.get('/health', (req, res) => {
  selectNow()
    .then(selected => {
      console.log(selected);
      res.json({ dbTimestamp: selected.now });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

subpath.post('/users/:name', (req, res) => {
  const name = req.params.name;
  const user = createUser(name);
  createUser(name).then(createdUser => res.json(createdUser));
});

subpath.get('/users/:id', (req, res) => {
  const id: number = parseInt(req.params.id, 10);
  getUser(id).then(user => res.json(user));
});

app.get('/test/get/:id', async (req, res) => {
  const id = req.params.id;
  res.json({ id });
});

app
  .listen(port)
  .on('error', async (err: any) => {
    if (err) {
      return console.error(err);
    }
  })
  .on('success', () => {
    return console.log(`server is listening on ${port}`);
  });
