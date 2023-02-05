import {
  ActionMenu,
  Button,
  ButtonGroup,
  Item
} from '@adobe/react-spectrum';
import {
  type ChildComponent,
  type HTMLAttributes,
  useCallback,
  Key,
} from 'react';
import {
  FaCheckSquare,
  FaChevronCircleUp,
  FaShareSquare
} from 'react-icons/fa';
import styled from 'styled-components';

import {
  useConnect
} from '../hooks/useConnect';
import {
  type TimelineDTO,
  useTimeline
} from '../hooks/useTimeline';
import {
  Heading,
  Section
} from './Heading';

interface QuickHostActionsMenuProps extends HTMLAttributes<HTMLButtonElement> {
  host: string;
  id: string;
}

const PostMetrics = styled.div`
    * {
        vertical-align: middle;
    }

    > span {
        padding: 0 8px;
    }

    svg {
        margin-right: 4px;
    }

    > * + * {
        margin-left: 16px;
    }
`;

const TimelineItemControls = styled.div`
    button {
        display: flex;
        align-items: center;

        svg {
            margin-right: 4px;
        }

        &[aria-pressed="true"] {
            color: green;
        }
    }
`;

const TimelineItem = styled.li`
    p + p {
        margin-top: 12px;
    }

    ${TimelineItemControls},
    ${PostMetrics} {
        margin-top: 20px;
    }
`;

const TimelineList = styled.ol`
    ${TimelineItem} + ${TimelineItem} {
        margin-top: 36px;
    }
`;

const BylineContainer = styled.div`
    display: flex;
    align-items: center;
`;

const QuickHostActionsMenu: ChildComponent<QuickHostActionsMenuProps> = (
  props
) => {
  const { host, id } = props;
  const { busy: isConnecting, execute: doConnect } = useConnect();
  const onAction = useCallback(
    async (key: Key) => {
      switch (key) {
        case `connect`: {
          console.log(`connect`);
          // await doConnect({
          //   host,
          // });
          return;
        }
        case `block`: {
          console.log(`block`);
          return;
        }
        default:
      }
    },
    [ doConnect, host ]
  );

  return (
    <ActionMenu disabledKeys={[`title`]} id={id} isQuiet onAction={onAction}>
      <Item key="title">{host}</Item>
      <Item key="connect">Connect</Item>
      <Item key="block">Block</Item>
    </ActionMenu>
  );
};

const Byline: ChildComponent<Partial<TimelineDTO>> = (props) => {
  const { author, original_host, timeline_host, uuid } = props;
  const authorName = !author || author === `` ? `unknown` : author;
  const postId = `${author}-${uuid}`;

  if (original_host && timeline_host) {
    return (
      <>
        {authorName}@
        <a
          href={`https://${timeline_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {timeline_host}
        </a>
        <QuickHostActionsMenu host={timeline_host} id={postId} />
        <FaShareSquare />
        &nbsp;shared from&nbsp;
        <a
          href={`https://${original_host}`}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {original_host}
        </a>
        <QuickHostActionsMenu host={original_host} id={postId} />
      </>
    );
  }

  if (original_host && !timeline_host) {
    return (
      <>
        <FaShareSquare />
            &nbsp;
        <a
            href={`https://${original_host}`}
            referrerPolicy="no-referrer"
            target="_blank"
        >
          {original_host}
        </a>
        <QuickHostActionsMenu
            host={original_host}
            id={postId}
        />
      </>
    );
  }

  if (timeline_host && !original_host) {
    return (
        <>
          <span>{authorName}&nbsp;@&nbsp;</span>
          <a
            href={`https://${timeline_host}`}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {timeline_host}
          </a>
          <QuickHostActionsMenu
            host={timeline_host}
            id={postId}
          />
        </>
    );
  }

  return (
    <span>me</span>
  );
};

interface TimelineItemProps {
  item: TimelineDTO;
  onShare: (item: TimelineDTO) => void;
  onUpvote: (item: TimelineDTO) => void;
}

const TimelineEntryControls: ChildComponent<TimelineItemProps> = (props) => {
  const {
    item,
    onShare,
    onUpvote
  } = props;
  const {
    original_host,
    score,
    share_count,
    timeline_host,
  } = item;
  const onShareItem = useCallback(() => {
    onShare?.(item);
  }, [ item, onShare ]);
  const onUpvoteItem = useCallback(() => {
    onUpvote?.(item);
  }, [ item, onUpvote ]);
  const ownPost = !original_host && !timeline_host;

  if (ownPost) {
    return (
      <PostMetrics>
        <span>
          <FaShareSquare />
          <span>
            shares: {share_count}
          </span>
        </span>
        <span>
          <FaChevronCircleUp />
          <span>
            upvotes: {score}
          </span>
        </span>
      </PostMetrics>
    );
  }

  return (
    <TimelineItemControls>
      <ButtonGroup orientation="horizontal">
        <Button
          aria-pressed={item.shared}
          onPressEnd={onShareItem}
          variant="secondary"
        >
          {item.shared ? <FaCheckSquare /> : <FaShareSquare />}
          <span>share</span>
        </Button>
        <Button
          aria-pressed={item.upvoted}
          onPressEnd={onUpvoteItem}
          variant="secondary"
        >
          {item.upvoted ? <FaCheckSquare /> : <FaChevronCircleUp />}
          <span>upvote</span>
        </Button>
      </ButtonGroup>
    </TimelineItemControls>
  );
};

const TimelineEntry: ChildComponent<TimelineItemProps> = (props) => {
  const {
    item,
    onShare,
    onUpvote
  } = props;
  const {
    text
  } = item;

  return (
    <TimelineItem>
      <BylineContainer>
        <Byline {...item} />
      </BylineContainer>
      <div
        dangerouslySetInnerHTML={{
          __html: text,
        }}
      />
      <TimelineEntryControls
        item={item}
        onShare={onShare}
        onUpvote={onUpvote}
      />
    </TimelineItem>
  );
};

const Timeline: ChildComponent = (props) => {
  const {
    data: timelineEntries,
    onShare,
    onUpvote
  } = useTimeline();

  return (
    <Section>
      <Heading>
        Latest posts
      </Heading>

      <TimelineList
        {...props}
        role="feed"
      >
        {timelineEntries?.map((item) => (
          <TimelineEntry
            key={item.uuid ?? ``}
            item={item}
            onShare={onShare}
            onUpvote={onUpvote}
          />
        ))}
      </TimelineList>
    </Section>
  );
};

export default styled(Timeline)``;
