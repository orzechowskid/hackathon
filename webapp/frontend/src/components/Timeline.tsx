import {
  type ChildComponent,
  useCallback
} from 'react';
import {
  FaChevronCircleUp,
  FaShareSquare
} from 'react-icons/fa';
import styled from 'styled-components';

import {
  type TimelineDTO,
  useTimeline
} from '../hooks/useTimeline';
import Button from './Button';

const TimelineItemButton = styled(Button)`
  padding: 4px;
  display: inline-flex;
  align-items: center;
  grid-gap: 4px;

  svg {
    transition: transform 0.2s;
    transform: none;
  }

  > * {
    vertical-align: middle;
  }

  &:not([disabled]):hover svg {
    transform: scale(1.2);
  }

  &[aria-pressed="true"] svg {
    color: var(--color-green-500);
  }
`;

const BylineContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 14px;
  color: var(--gray-700);
  font-style: italic;

  div:first-of-type {
    margin-right: 8px;
  }

  svg {
    vertical-align: middle;
    color: var(--color-gray-300);
  }
`;

const TimelineItemContainer = styled.div`
  display: grid;
  grid-template-rows: max-content;
  grid-template-columns: 44px 44px 1fr;
  grid-gap: 12px;

  div:first-child {
    grid-row: 2;
    grid-column: 1 / 4;
  }

  ${BylineContainer} {
    grid-row: 1;
    grid-column: 1 / 4;
  }

  ${TimelineItemButton} span {
    display: none;
  }

  @media (min-width: 480px) {
    grid-template-columns: 100px 100px 1fr;

    ${TimelineItemButton} span {
      display: initial;
    }
  }
`;

const TimelineContainer = styled.div`
  overflow-y: auto;

  ${TimelineItemContainer} + ${TimelineItemContainer} {
    margin-top: 48px;
  }
`;

const Byline: ChildComponent<Partial<TimelineDTO>> = (props) => {
  const {
    author,
    original_host,
    timeline_host
  } = props;
  const authorName = (!author || author === '')
    ? 'unknown'
    : author;

  if (original_host && timeline_host) {
    return (
      <BylineContainer>
        <div>
          {authorName}&nbsp;@&nbsp;
          <a
            href={`https://${timeline_host}`}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {timeline_host}
          </a>
        </div>
        <div>
          <FaShareSquare />
          <a
            href={`https://${original_host}`}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {original_host}
          </a>
        </div>
      </BylineContainer>
    );
  }

  if (original_host && !timeline_host) {
    return (
      <BylineContainer>
        <FaShareSquare />
        &nbsp;<a
          href={`https://${original_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {original_host}
        </a>
      </BylineContainer>
    );
  }

  if (timeline_host && !original_host) {
    return (
      <BylineContainer>
        <span>
          {authorName}&nbsp;@&nbsp;
        </span>
        <a
          href={`https://${timeline_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {timeline_host}
        </a>
      </BylineContainer>
    );
  }

  return (
    <BylineContainer>
      <span>
        me
      </span>
    </BylineContainer>
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
      <div
        dangerouslySetInnerHTML={{
          __html: text
        }}
      />
      <Byline {...item} />
      {!ownPost && (
        <>
          <TimelineItemButton
            aria-pressed={item.shared}
            onClick={onShareItem}
          >
            <FaShareSquare />
            <span>
              share
            </span>
          </TimelineItemButton>
          <TimelineItemButton>
            <FaChevronCircleUp />
            <span>
              upvote
            </span>
          </TimelineItemButton>
        </>
      )}
    </TimelineItemContainer>
  );
};

const Timeline: ChildComponent = (props) => {
  const {
    create,
    data: timelineEntries,
    share
  } = useTimeline();
  const onShare = useCallback(async (item: TimelineDTO) => {
    try {
      await share(item);
    }
    catch (ex: any) {
      alert(ex.message);
    }
  }, [ create ]);

  return (
    <TimelineContainer {...props}>
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

export default styled(Timeline)``;
