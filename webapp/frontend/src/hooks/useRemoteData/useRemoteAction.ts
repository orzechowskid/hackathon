import {
  useCallback,
  useState,
} from 'react';

import {
  useIdentity
} from '../useIdentity';

interface RemoteActionOpts<Res, Req> {
  verb: Request[`method`]
}

const useRemoteAction = function<Response extends object, Request = void>(apiEndpoint: string, opts?: RemoteActionOpts<Response, Request>) {
  const {
    token
  } = useIdentity();
  const [ busy, setBusy ] = useState<boolean>(false);
  const execute = useCallback(async (payload?: Request, initOpts?: RequestInit) => {
    try {
      setBusy(true);

      const response = await window.fetch(apiEndpoint, {
        method: opts?.verb ?? `POST`,
        ...(payload ? { body: JSON.stringify(payload) } : {}),
        ...(initOpts ?? {}),
        headers: {
          ...(initOpts?.headers ?? {}),
          ...(payload ? { 'Content-Type': `application/json` } : {}),
          ...(token ? { 'X-JWT': token } : {})
        }
      });

      setBusy(false);

      if (response.headers.get(`Content-Type`) === `application/json`) {
        return response.json() as Promise<Response>;
      }
    }
    catch (ex) {
      setBusy(false);
      throw (ex);
    }
  }, [ apiEndpoint, opts?.verb, token ]);

  return {
    busy,
    execute
  };
};

export {
  useRemoteAction
};
