import {
  useRemoteData
} from './useRemoteData';

interface ExploreDTO {
  topics: string[];
  users: string[];
}

const useExplore = () =>
  useRemoteData<ExploreDTO>('/api/1/my/explore');

export {
  useExplore
};
