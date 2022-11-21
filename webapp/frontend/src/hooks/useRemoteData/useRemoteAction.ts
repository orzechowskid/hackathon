import {
  useCallback,
  useState,
} from 'react';

import {
  useIdentity
} from '../useIdentity';

const useRemoteAction = function<ResponsePayload extends object, RequestPayload = void>(apiEndpoint: string) {
  const {
    token
  } = useIdentity();
  const [ busy, setBusy ] = useState<boolean>(false);
  const execute = useCallback(async (payload?: RequestPayload, initOpts?: RequestInit) => {
    try {
      setBusy(true);

      const response = await window.fetch(apiEndpoint, {
        method: 'POST',
        ...(payload ? { body: JSON.stringify(payload) } : {}),
        ...(initOpts ?? {}),
        headers: {
          ...(initOpts?.headers ?? {}),
          ...(payload ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { 'X-JWT': token } : {})
        }
      });

      if (response.headers.get('Content-Type') === 'application/json') {
        return response.json() as Promise<ResponsePayload>;
      }

      setBusy(false);
    }
    catch (ex) {
      setBusy(false);
      throw (ex);
    }
  }, [ token ]);

  return {
    busy,
    execute
  };
};

export {
  useRemoteAction
};
