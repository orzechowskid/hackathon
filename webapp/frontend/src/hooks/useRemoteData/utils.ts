export interface Collectible {
  uuid: string;
};

const getFetcher = <T>(token: string | null) => (path: RequestInfo) =>
  window.fetch(path, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    }
  }).then((res) => res.json() as Promise<T>);

export {
  getFetcher
};
