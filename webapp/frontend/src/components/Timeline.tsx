import {
  ActionMenu,
  Button,
  ButtonGroup,
  Item
} from "@adobe/react-spectrum";
import {
  type ChildComponent,
  type HTMLAttributes,
  useCallback,
  Key,
} from "react";
import { FaCheckSquare, FaChevronCircleUp, FaShareSquare } from "react-icons/fa";
import styled from "styled-components";

import { useConnect } from "../hooks/useConnect";
import { type TimelineDTO, useTimeline } from "../hooks/useTimeline";
import {
  Heading,
  Section
} from './Heading';

interface QuickHostActionsMenuProps extends HTMLAttributes<HTMLButtonElement> {
  host: string;
  id: string;
}

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

    ${TimelineItemControls} {
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
        <div>
          {authorName}@
          <a
            href={`https://${timeline_host}`}
            referrerPolicy="no-referrer"
            target="_blank"
          >
            {timeline_host}
          </a>
          <QuickHostActionsMenu host={timeline_host} id={postId} />
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
          <QuickHostActionsMenu host={original_host} id={postId} />
        </div>
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
}

const TimelineEntry: ChildComponent<TimelineItemProps> = (props) => {
  const { item, onShare } = props;
  const { original_host, text, timeline_host } = item;
  const onShareItem = useCallback(() => {
    onShare?.(item);
  }, [ item, onShare ]);
  const ownPost = !original_host && !timeline_host;

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
      {!ownPost && (
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
            <Button variant="secondary">
              <FaChevronCircleUp />
              <span>upvote</span>
            </Button>
          </ButtonGroup>
        </TimelineItemControls>
      )}
    </TimelineItem>
  );
};

const Timeline: ChildComponent = (props) => {
  const { create, data: timelineEntries, share } = useTimeline();
  const onShare = useCallback(
    async (item: TimelineDTO) => {
      try {
        await share(item);
      } catch (ex: any) {
        alert(ex.message);
      }
    },
    [share]
  );

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
          />
        ))}
      </TimelineList>
    </Section>
  );
};

export default styled(Timeline)``;
