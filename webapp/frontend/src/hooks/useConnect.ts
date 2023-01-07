import {
  useRemoteAction
} from './useRemoteData';

interface ConnectRequest {
  host: string;
}

interface ConnectResponse {
  ok: boolean;
}

const useConnect = () => {
  return useRemoteAction<ConnectResponse, ConnectRequest>('/api/1/my/connect');
};

export {
  useConnect
};
