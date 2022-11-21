import {
  useCallback
} from 'react';
import {
  useRemoteAction
} from "./useRemoteData";
import {
  useRemoteCollection
} from "./useRemoteData/useRemoteCollection";

export interface TimelineDTO {
  author: string;
  created_at: string;
  original_author?: string;
  original_created_at?: string;
  original_host?: string;
  original_uuid?: string;
  permissions: 'public' | 'protected' | 'private';
  score: number;
  text: string;
  timeline_host?: string;
  uuid: string;
}

const useTimeline = () => {
  const timeline = useRemoteCollection<TimelineDTO>('/api/1/my/timeline', {
    swrOpts: {
      dedupingInterval: 50000,
      refreshInterval: 30000
    }});
  const shareAction = useRemoteAction<TimelineDTO, TimelineDTO>('/api/1/my/timeline/share');
  const share = useCallback(async (post: TimelineDTO) => {
    try {
      await shareAction.execute(post, {});
      timeline.refresh();
    }
    catch (ex: any) {
      console.error(ex?.message ?? ex ?? 'unknown error while sharing post');
    }
  }, [ shareAction?.execute, timeline.refresh ]);

  return {
    ...timeline,
    busy: timeline.busy || shareAction.busy,
    share
  };
};

export {
  useTimeline
};
