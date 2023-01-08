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
  getFetcher
} from './utils';

export interface RemoteCollectionOpts {
  createEndpoint?: string;
  swrOpts?: SWRConfiguration;
}

const postFetcher = <T extends Collectible>(token: string | null) => (path: RequestInfo, payload: Partial<T>) =>
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
  })).then((res) => res.json() as Promise<T[]>);

const putFetcher = <T extends Collectible>(token: string | null) => (path: RequestInfo, uuid: string, payload: T) =>
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

const useRemoteCollection = function <T extends Collectible>(apiEndpoint: string, opts?: RemoteCollectionOpts) {
  const {
    createEndpoint = apiEndpoint,
    swrOpts
  } = opts ?? {};
  const {
    token
  } = useIdentity();
  const {
    data,
    error,
    isValidating,
    mutate
  } = useSWR<T[]>(apiEndpoint, getFetcher<T[]>(token), swrOpts);
  const create = useCallback(async (newObject: Partial<T>) => {
    await mutate(postFetcher<T>(token)(createEndpoint, newObject), {
      /* warning: footgun */
      optimisticData: [ ...(data ?? []), newObject as T ],
      rollbackOnError: true,
      populateCache: true,
      revalidate: false
    });
  }, [ createEndpoint, data, mutate, token ]);
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
      await mutate(putFetcher<T>(token)(apiEndpoint, uuid, payload), {
        optimisticData,
      });
    }
  }, [ apiEndpoint, data, mutate, token ]);
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
