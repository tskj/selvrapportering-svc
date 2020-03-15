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
} from './settings/settings';

const app = express();
const subpath = express();
const port = process.env.PORT || 6789;

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

subpath.get('/health', (req, res) => res.send());

app.get('/test/get/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  res.json({ id });
});

app
  .listen(port)
  .on('error', async (err: any) => {
    if (err) {
      console.log('hei');
      return console.error(err);
    }
  })
  .on('success', () => {
    console.log('du');
    return console.log(`server is listening on ${port}`);
  });
