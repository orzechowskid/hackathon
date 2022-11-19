import {
  useRemoteCollection
} from "./useRemoteData/useRemoteCollection";

export interface TimelineDTO {
  author: string;
  created_at: string;
  original_host?: string;
  permissions: 'public' | 'protected' | 'private';
  text: string;
  timeline_host: string;
  uuid: string;
}

const useTimeline = () =>
  useRemoteCollection<TimelineDTO>('/api/1/my/timeline', {
    createEndpoint: '/api/1/my/timeline',
    swrOpts: {
      refreshInterval: 30000
    }});

export {
  useTimeline
};
