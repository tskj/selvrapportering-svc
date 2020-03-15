import fetch from 'node-fetch';

interface IRequest {
  host: string;
  path: string;
  body?: any;
}

export const get = ({ host, path }: IRequest) =>
  fetchAndValidate('GET', host, path).then(res => res.json());

export const post = ({ host, path, body }: IRequest) =>
  fetchAndValidate('POST', host, path, body).then(res => res.json());

export const patch = ({ host, path, body }: IRequest) =>
  fetchAndValidate('PATCH', host, path, body);

export const put = ({ host, path, body }: IRequest) =>
  fetchAndValidate('PUT', host, path, body).then(res => res.json());

export const del = ({ host, path, body }: IRequest) =>
  fetchAndValidate('DELETE', host, path, body);

// Utils

const options = (method: string, body?: string) => ({
  method,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    From: 'selvrapportering-svc',
  },
  body,
});

async function fetchAndValidate(
  method: string,
  host: string,
  path: string,
  body?: any
) {
  const url = `${host}${path}`;
  const response = await fetch(
    url,
    options(method, body && JSON.stringify(body))
  );

  if (response.ok) {
    return response;
  }

  const {
    userMessage = `Noe har feilet i et kall til ${method} ${url} med statuskode ${
      response.status
    }${body && ` og body ${body}`}`,
    message,
  } = await response.json().catch(() => ({}));

  return Promise.reject({
    type: response.status < 400 ? 'WARNING' : 'ERROR',
    title:
      response.status < 500
        ? `${response.status} Et nettverkskall har feilet`
        : `${response.status} Det er noe galt med backenden`,
    message: `${userMessage}\n${message}`,
  });
}
