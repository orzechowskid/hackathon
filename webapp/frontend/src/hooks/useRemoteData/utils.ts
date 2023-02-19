export interface Collectible {
  uuid: string;
};

const getFetcherFactory = <T>(token: string | null) => (path: RequestInfo) =>
  window.fetch(path, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    }
  }).then((res) => res.json() as Promise<T>);

const createFetcherFactory = <T extends Collectible, CreateShape = Partial<T>>(token: string | null) => (path: RequestInfo, payload: CreateShape) =>
  window.fetch(path, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': `application/json`,
      ...(token ? { 'X-JWT': token } : {})
    },
    method: `POST`
  }).then(() => window.fetch(path, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    }
  })).then((res) => res.json() as Promise<T>);

const updateFetcherFactory = <T extends Collectible>(token: string | null) => (path: RequestInfo, uuid: string, payload: T) =>
  window.fetch(`${path}/${uuid}`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': `application/json`,
      ...(token ? { 'X-JWT': token } : {})
    },
    method: `PUT`
  }).then(() => window.fetch(path, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    }
  })).then((res) => res.json() as Promise<T[]>);

/* warning: footgun */
const optimisticCreator =
  <T extends Collectible, CreateShape = Partial<T>>(obj: CreateShape) => (obj as unknown as T);

export {
  createFetcherFactory,
  getFetcherFactory,
  optimisticCreator,
  updateFetcherFactory
};
