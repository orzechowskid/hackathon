import {
  type ChildComponent,
  useEffect
} from 'react';
import styled from 'styled-components';

import {
  usePrivatePosts
} from '../hooks/usePosts';
import {
  type TimelineDTO,
  useTimeline
} from '../hooks/useTimeline';

const TimelineItemContainer = styled.div`
  background: var(--color-gray-700);
  padding: 24px;
`;

const TimelineContainer = styled.div`
  overflow-y: auto;

  ${TimelineItemContainer} + ${TimelineItemContainer} {
    margin-top: 48px;
  }
`;

const TimelineItem: ChildComponent<TimelineDTO> = (props) => {
  return (
    <TimelineItemContainer>
      <div>{props.author}</div>
      <div>{props.title}</div>
      <div>{props.text}</div>
    </TimelineItemContainer>
  );
};

const Timeline: ChildComponent = (props) => {
  const {
    data: timelineEntries,
    refresh
  } = useTimeline();
  const {
    data: posts
  } = usePrivatePosts();

  useEffect(() => {
    refresh();
  }, [ posts ]);

  return (
    <TimelineContainer>
      {timelineEntries?.map((item) => (
        <TimelineItem
          key={item.uuid}
          {...item}
        />
      ))}
    </TimelineContainer>
  );
};

export default Timeline;
