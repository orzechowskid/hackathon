import {
  useRemoteCollection
} from "./useRemoteData/useRemoteCollection";

export interface TimelineDTO {
  author: string;
  created_at: string;
  permissions: 'public' | 'protected' | 'private';
  tags: string[];
  text: string;
  title: string;
  uuid: string;
}

const useTimeline = () =>
  useRemoteCollection<TimelineDTO>('/api/1/my/timeline', {
    swrOpts: {
      refreshInterval: 30000
    }});

export {
  useTimeline
};
