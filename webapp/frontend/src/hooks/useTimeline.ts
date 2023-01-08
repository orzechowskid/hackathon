import {
  useCallback
} from 'react';

import {
  getMessageFromError
} from '../utils/error';
import {
  useRemoteAction
} from './useRemoteData';
import {
  useRemoteCollection
} from './useRemoteData/useRemoteCollection';

export interface TimelineDTO {
  author: string;
  created_at: string;
  original_author?: string;
  original_created_at?: string;
  original_host?: string;
  original_uuid?: string;
  permissions: `public` | `protected` | `private`;
  score: number;
  shared: boolean;
  text: string;
  timeline_host?: string;
  uuid: string;
}

const useTimeline = () => {
  const timeline = useRemoteCollection<TimelineDTO>(`/api/1/my/timeline`, {
    swrOpts: {
      dedupingInterval: 50000,
      refreshInterval: 30000
    }});
  const shareAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/share`);
  const unshareAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/share`, { verb: `DELETE` });
  const onShare = useCallback(async (post: TimelineDTO) => {
    try {
      if (post.shared) {
        await unshareAction.execute(post);
      }
      else {
        await shareAction.execute(post);
      }
    } catch (ex) {
      alert(getMessageFromError(ex));
    }
  }, [ shareAction, unshareAction ]);

  return {
    ...timeline,
    busy: timeline.busy || shareAction.busy,
    onShare
  };
};

export {
  useTimeline
};
