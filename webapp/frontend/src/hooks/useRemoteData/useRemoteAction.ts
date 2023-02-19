import {
  useCallback,
  useState,
} from 'react';

import {
  getMessageFromError
} from '../../utils/error';
import {
  useIdentity
} from '../useIdentity';

interface RemoteActionOpts<Res, Req> {
  fetcher?: (token: string | null, payload: Req) => (info: RequestInfo, opts?: RequestInit) => Promise<Res>;
  verb?: Request[`method`]
}

const fetchFactory = (token: string | null, payload: any) =>
  async (info: RequestInfo, opts?: RequestInit) => {
    const response = await window.fetch(info, {
      body: payload ? JSON.stringify(payload) : undefined,
      method: `POST`,
      ...opts,
      headers: {
        ...(payload ? { 'Content-Type': `application/json` } : {}),
        ...(token ? { 'X-JWT': token } : {}),
        ...(opts?.headers)
      }
    });
    const result = await response.json();

    return result;
  };

const useRemoteAction = <Response = void, Request = void>(apiEndpoint: string, opts?: RemoteActionOpts<Response, Request>) => {
  const {
    fetcher = fetchFactory
  } = opts ?? {};
  const {
    token
  } = useIdentity();
  const [ busy, setBusy ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>();
  const execute = useCallback(async (payload: Request) => {
    const actionFetcher = fetcher(token, payload);

    setError(undefined);
    setBusy(true);

    try {
      const response = await actionFetcher(apiEndpoint);

      setBusy(false);

      return response;
    }
    catch (ex) {
      setBusy(false);
      setError(getMessageFromError(ex));
    }
  }, [ apiEndpoint, fetcher, token ])

  return {
    busy,
    error,
    execute
  };
};

export {
  useRemoteAction
};
