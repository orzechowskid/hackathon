import {
  useCallback
} from 'react';
import useSWR, {
  type SWRConfiguration
} from 'swr';

import {
  useIdentity
} from '../useIdentity';
import {
  getFetcherFactory
} from './utils';

interface RemoteDataOpts {
  getFetcher?: typeof getFetcherFactory;
  swrOpts: SWRConfiguration;
}

const putFetcher = <T extends object>(token: string | null) => (path: RequestInfo, payload: T) =>
  window.fetch(path, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': `application/json`,
      ...(token ? { 'X-JWT': token } : {})
    },
    method: `PUT`
  }).then((res) => res.json() as T);

const useRemoteData = function<T extends object>(apiEndpoint: string, opts?: RemoteDataOpts) {
  const {
    getFetcher = getFetcherFactory,
    swrOpts
  } = opts ?? {};
  const {
    token
  } = useIdentity();
  const {
    data,
    error,
    mutate
  } = useSWR<T>(apiEndpoint, getFetcher<T>(token), swrOpts);
  const update = useCallback(async (payload: T) => {
    await mutate(putFetcher<T>(token)(apiEndpoint, payload), {
      optimisticData: payload,
      rollbackOnError: true,
      populateCache: true,
      revalidate: false
    })
  }, [ apiEndpoint, mutate, token ]);

  return {
    data,
    error,
    refresh: mutate,
    update
  };
};

export {
  useRemoteData
}
