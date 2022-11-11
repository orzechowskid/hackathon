import {
  useCallback
} from 'react';

import {
  useIdentity
} from '../useIdentity';

const useRemoteAction = function<ResponsePayload extends object, RequestPayload = void>(apiEndpoint: string) {
  const {
    token
  } = useIdentity();
  const execute = useCallback(async (payload?: RequestPayload, initOpts?: RequestInit) => {
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
  }, [ token ]);

  return {
    execute
  };
};

export {
  useRemoteAction
};
