import {
  type ParentComponent,
  createContext,
  useCallback,
  useContext,
  useState
} from 'react';
import { useIdentity } from './useIdentity';

interface RemoteDataProviderShape {
  get: (arg0: string, arg1?: RequestInit) => Promise<any>;
  post: (arg0: string, arg1?: object, arg2?: RequestInit) => Promise<any>;
}

const RemoteDataContext = createContext<RemoteDataProviderShape>({
  get: () => Promise.reject(),
  post: () => Promise.reject()
});

const RemoteDataProvider: ParentComponent = ({ children }) => {
  const {
    token
  } = useIdentity();
  const jwt = token ?? 'none';
  const get = useCallback(async (path: string, requestInit?: RequestInit) => {
    return window.fetch(path, {
      ...(requestInit ?? {}),
      headers: {
        ...(requestInit?.headers ?? {}),
        'X-JWT': jwt
      }
      })
      .then((response) => response.json());
  }, [ jwt ]);
  const post = useCallback(async (path: string, payload?: object, requestInit?: RequestInit) => {
    return window.fetch(path, {
      ...(requestInit ?? {}),
      body: JSON.stringify(payload),
      headers: {
        ...(requestInit?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-JWT': jwt
      },
      method: 'POST'
    }).then((response) => response.json());
  }, [ jwt ]);

  return (
    <RemoteDataContext.Provider value={{ get, post }}>
      {children}
    </RemoteDataContext.Provider>
  );
};

const useRemoteData = () => useContext(RemoteDataContext);

export {
  RemoteDataProvider,
  useRemoteData
};
