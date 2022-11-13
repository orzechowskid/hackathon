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

const ExternalHost = styled.span`
  font-size: 14px;
  color: var(--gray-700);
  font-style: italic;
`;

const TimelineItemContainer = styled.div`
  padding: 24px;
  grid-gap: 12px;

  ${ExternalHost} {
    margin-left: 30px;
  }
`;

const TimelineContainer = styled.div`
  overflow-y: auto;

  ${TimelineItemContainer} + ${TimelineItemContainer} {
    margin-top: 48px;
  }
`;

const TimelineItem: ChildComponent<TimelineDTO> = (props) => {
  const {
    author,
    host,
    original_host,
    text
  } = props;
  const ownPost = host === window.location.hostname;

  return (
    <TimelineItemContainer>
      {ownPost ? (
        <div>{props.author}</div>
      ) : (
        <div>
          <a
            href={`https://${host}`}
            target="_blank"
          >
            {author}
          </a>
          <ExternalHost>
            {original_host}
          </ExternalHost>
        </div>
      )}
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
