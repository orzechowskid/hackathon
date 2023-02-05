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
  share_count: number;
  shared: boolean;
  text: string;
  timeline_host?: string;
  upvoted: boolean;
  uuid: string;
}

const useTimeline = () => {
  const timeline = useRemoteCollection<TimelineDTO>(`/api/1/my/timeline`, {
    swrOpts: {
      dedupingInterval: 5000,
      refreshInterval: 30000
    }});
  const shareAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/share`);
  const unshareAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/share`, { verb: `DELETE` });
  const upvoteAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/upvote`);
  const downvoteAction = useRemoteAction<TimelineDTO, TimelineDTO>(`/api/1/my/timeline/upvote`, { verb: `DELETE` });
  const {
    update
  } = timeline;
  const onShare = useCallback(async (post: TimelineDTO) => {
    try {
      update(post.uuid, {
        ...post,
        shared: !post.shared
      }, true);

      if (post.shared) {
        await unshareAction.execute(post);
      }
      else {
        await shareAction.execute(post);
      }
    } catch (ex) {
      alert(getMessageFromError(ex));
    }
  }, [ shareAction, unshareAction, update ]);
  const onUpvote = useCallback(async (post: TimelineDTO) => {
    try {
      update(post.uuid, {
        ...post,
        upvoted: !post.upvoted
      }, true);

      if (post.upvoted) {
        await downvoteAction.execute(post);
      }
      else {
        await upvoteAction.execute(post);
      }
    }
    catch (ex) {
      alert(getMessageFromError(ex));
    }
  }, [ upvoteAction, downvoteAction, update ]);
  const busy = timeline.busy
    || shareAction.busy
    || unshareAction.busy
    || upvoteAction.busy
    || downvoteAction.busy;

  return {
    ...timeline,
    busy,
    data: timeline.data?.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) ?? [],
    onShare,
    onUpvote
  };
};

export {
  useTimeline
};
