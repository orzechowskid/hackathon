import {
  type ChildComponent,
  useCallback,
  useEffect
} from 'react';
import {
  FaShareSquare
} from 'react-icons/fa';
import styled from 'styled-components';

import {
  type TimelineDTO,
  useTimeline
} from '../hooks/useTimeline';
import Button from './Button';

const Origin = styled.div`
  font-size: 14px;
  color: var(--gray-700);
  font-style: italic;

  a + svg {
    margin: 0 8px 0 12px;
  }

  > * {
    color: inherit;
    font-size: inherit;
    font-style: inherit;
    vertical-align: middle;
  }
`;

const TimelineItemContainer = styled.div`
  padding: 24px;
  grid-gap: 12px;
`;

const TimelineContainer = styled.div`
  overflow-y: auto;

  ${TimelineItemContainer} + ${TimelineItemContainer} {
    margin-top: 48px;
  }
`;

const PostOrigin: ChildComponent<Partial<TimelineDTO>> = (props) => {
  const {
    author = 'unknown',
    original_host,
    timeline_host
  } = props;

  if (original_host && timeline_host) {
    return (
      <Origin>
        <span>
          {author}@
        </span>
        <a
          href={`https://${timeline_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {timeline_host}
        </a>
        <FaShareSquare />
        <a
          href={`https://${original_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {original_host}
        </a>
      </Origin>
    );
  }

  if (original_host && !timeline_host) {
    return (
      <Origin>
        <FaShareSquare />
        <a
          href={`https://${original_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {original_host}
        </a>
      </Origin>
    );
  }

  if (timeline_host && !original_host) {
    return (
      <Origin>
        <span>
          {author}@
        </span>
        <a
          href={`https://${timeline_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {timeline_host}
        </a>
      </Origin>
    );
  }

  return (
    <Origin>
      <span>
        me
      </span>
    </Origin>
  );
};

interface TimelineItemProps {
  item: TimelineDTO;
  onShare: (item: TimelineDTO) => void;
};

const TimelineItem: ChildComponent<TimelineItemProps> = (props) => {
  const {
    item,
    onShare
  } = props;
  const {
    author,
    original_host,
    text,
    timeline_host
  } = item;
  const onShareItem = useCallback(() => {
    onShare?.(item);
  }, []);
  const ownPost = !original_host && !timeline_host;

  return (
    <TimelineItemContainer>
      <PostOrigin {...item} />
      <div>
        {text}
      </div>
      <div>
        {!ownPost && (
          <Button onClick={onShareItem}>
            share
          </Button>
        )}
      </div>
    </TimelineItemContainer>
  );
};

const Timeline: ChildComponent = (props) => {
  const {
    data: timelineEntries,
    refresh
  } = useTimeline();
  const {
    data: posts,
    create
  } = useTimeline();
  const onShare = useCallback(async (item: TimelineDTO) => {
    try {
      await create({
        ...item,
        uuid: ''
      });
    }
    catch (ex: any) {
      alert(ex.message);
    }
  }, [ create ]);

  useEffect(() => {
    refresh();
  }, [ posts ]);

  return (
    <TimelineContainer>
      {timelineEntries?.map((item) => (
        <TimelineItem
          key={item.uuid ?? ''}
          item={item}
          onShare={onShare}
        />
      ))}
    </TimelineContainer>
  );
};

export default Timeline;
