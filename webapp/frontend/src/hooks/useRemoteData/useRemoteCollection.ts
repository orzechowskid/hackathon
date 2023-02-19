import {
  useCallback,
} from 'react';
import useSWR, {
  type SWRConfiguration
} from 'swr';

import {
  useIdentity
} from '../useIdentity';
import {
  type Collectible,
  createFetcherFactory,
  getFetcherFactory,
  optimisticCreator,
  updateFetcherFactory
} from './utils';

export interface RemoteCollectionOpts<T, CreateShape> {
  createEndpoint?: string;
  createFetcher?: (token: string | null) => (info: RequestInfo, opts?: CreateShape) => Promise<T>;
  getFetcher?: (token: string | null) => (info: RequestInfo) => Promise<T[]>;
  optimisticCreate?: (arg0: CreateShape) => T;
  swrOpts?: SWRConfiguration;
  updateFetcher?: typeof updateFetcherFactory;
}
const deleteFetcher = <T extends Collectible>(token: string | null) => (path: RequestInfo, uuid: string) =>
  window.fetch(`${path}/${uuid}`, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    },
    method: `DELETE`
  }).then(() => window.fetch(path, {
    headers: {
      ...(token ? { 'X-JWT': token } : {})
    }
  })).then((res) => res.json() as Promise<T[]>);

const useRemoteCollection = function <T extends Collectible, CreateShape = Partial<T>>(apiEndpoint: string, opts?: RemoteCollectionOpts<T, CreateShape>) {
  const {
    createEndpoint = apiEndpoint,
    createFetcher = createFetcherFactory,
    getFetcher = getFetcherFactory,
    optimisticCreate = optimisticCreator,
    swrOpts,
    updateFetcher = updateFetcherFactory
  } = opts ?? {};
  const {
    token
  } = useIdentity();
  const {
    data,
    error,
    isValidating,
    mutate
  } = useSWR<T[]>(apiEndpoint, getFetcher(token), swrOpts);
  const create = useCallback(async (newObject: CreateShape) => {
    await mutate(createFetcher<T, CreateShape>(token)(createEndpoint, newObject), {
      optimisticData: [ ...(data ?? []), optimisticCreate(newObject) ],
      rollbackOnError: true,
      populateCache: true,
      revalidate: false
    });
  }, [ createEndpoint, createFetcher, data, mutate, optimisticCreate, token ]);
  const update = useCallback(async (uuid: string, payload: T, quiet?: boolean) => {
    const idx = data?.findIndex((record) => record.uuid === uuid);
    const optimisticData = idx
      ? [
        ...(data?.slice(0, idx) ?? []),
        payload,
        ...(data?.slice(idx + 1) ?? [])
      ]
      : [];
    if (quiet) {
      await mutate(optimisticData, {
        populateCache: false
      });
    }
    else {
      await mutate(updateFetcher<T>(token)(apiEndpoint, uuid, payload), {
        optimisticData
      });
    }
  }, [ apiEndpoint, data, mutate, token, updateFetcher ]);
  const remove = useCallback(async (uuid: string) => {
    await mutate(deleteFetcher<T>(token)(apiEndpoint, uuid), {
      optimisticData: data?.filter((record) => record.uuid !== uuid),
      rollbackOnError: true,
      populateCache: true,
      revalidate: false
    });
  }, [ apiEndpoint, data, mutate, token ]);

  return {
    busy: isValidating,
    create,
    data,
    error,
    refresh: mutate,
    remove,
    update
  };
};

export {
  useRemoteCollection
};
