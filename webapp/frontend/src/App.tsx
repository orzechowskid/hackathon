import {
  type ButtonClickEvent,
  type ChildComponent,
  type ChangeEvent,
  type FormSubmitEvent,
  type FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  useLocation
} from 'react-router';
import styled from 'styled-components';

import {
  useRemoteData
} from './hooks/useRemoteData';
import {
  formatTimeAgo
} from './utils/time';

const TimelineContainer = styled.div`
`;
const ConnectContainer = styled.div`
`;
const TimelineItemTimestamp = styled.div`
`;
const TimelineItemContent = styled.div`
`;
const TimelineMarker = styled.div`
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a0d0a0;
  border: solid 1px #a0d0a0;
`;
const TimelineMarkerLine = styled.div`
  width: 0;
  position: relative;
  left: 1px;
  border: 1px solid #a0d0a0;
`;
const ExploreContainer = styled.div`
`;
const NewPostContainer = styled.form`
  textarea {
    display: block;
  }

  [disabled] {
    display: none;
  }
`;
const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 100px 4px 1fr;
  grid-gap: 12px;

  ${TimelineItemTimestamp} {
    grid-row: 1;
    grid-column: 1;
  }

  ${TimelineMarker} {
    grid-row: 1;
    grid-column: 2;
    justify-self: center;
    align-self: flex-start;
  }

  ${TimelineMarkerLine} {
    grid-row: 1 / span 2;
    grid-column: 2;
    min-height: 96px;
  }

  ${TimelineItemContent} {
    grid-row: 1 / span 2;
    grid-column: 3;
    margin: 12px;
    background-color: white;
    transition: background-color 0.1s linear;

    &:hover {
      background-color: #fafafa;
    }
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;

  h1 {
    grid-row: 1;
    grid-column: 1;
  }

  ${ConnectContainer} {
    grid-row: 2;
    grid-column: 1;
  }

  ${TimelineContainer} {
    grid-row: 2 / span 3;
    grid-column: 2;
  }

  ${ExploreContainer} {
    grid-row: 3;
    grid-column: 1;
  }
`;

interface NewPostForm {
  content: HTMLTextAreaElement;
  title: HTMLInputElement;
}

function NewPostPanel() {
  const {
    post
  } = useRemoteData();
  const [ showInput, setShowInput ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>();
  const [ text, setText ] = useState<string>('');
  const onClickShow = useCallback((e: ButtonClickEvent) => {
    setShowInput(true);
  }, []);
  const onCancel = useCallback((e: ButtonClickEvent) => {
    setShowInput(false);
  }, []);
  const onSubmit = useCallback(async (e: FormSubmitEvent<NewPostForm>) => {
    const {
      elements
    } = e.currentTarget;
    try {
      setError(undefined);
      const result = await post('api/1/post', {
        groups: [ 'public' ],
        tags: [],
        text: elements.content.value,
        title: elements.title.value
      });
      setText('');
      setShowInput(false);
    }
    catch (ex: any) {
      setError(ex.message);
    }
  }, [ text ]);

  return (
    <NewPostContainer onSubmit={onSubmit}>
      <label>
        <div>Title</div>
        <input
          id="title"
          type="text"
        />
      </label>
      <label>
        <div>Message</div>
        <textarea
          disabled={!showInput}
        />
      </label>
      {error ?? ''}
      <button
        disabled={!showInput}
        type="submit"
      >
        Post!
      </button>
      <button
        disabled={showInput}
        onClick={onClickShow}
      >
        <span aria-hidden>+ </span>New post
      </button>
      <button
        disabled={!showInput}
        onClick={onCancel}
      >
        Forget it
      </button>
    </NewPostContainer>
  );
}

interface PostDTO {
  content: string;
  published: number;
}

interface PostCardProps {
  post: PostDTO;
}

const PostCard: FunctionComponent<PostCardProps> = (props) => {
  const {
    post
  } = props;

  return (
    <TimelineItem>
      <TimelineItemTimestamp>
        {formatTimeAgo(new Date(post.published))}
      </TimelineItemTimestamp>
      <TimelineMarkerLine />
      <TimelineMarker />
      <TimelineItemContent>
        {post.content}
      </TimelineItemContent>
    </TimelineItem>
  );
};

const App: ChildComponent = (props) => {
  const location = useLocation();
  const {
    get,
    post
  } = useRemoteData();
  const [ timeline, setTimeline ] = useState<any[] | undefined>([]);
  const [ exploreData, setExploreData ] = useState<{ topics: string[]; users: string[]; }>({ topics: [], users: [] });
  const params = new URLSearchParams(location.search);
  const onClickConnect = useCallback((e: ButtonClickEvent) => {
    const textEl = document.getElementById('connectHost') as HTMLInputElement;

    e.preventDefault();
    post(`api/1/connect?host=${textEl.value}`)
      .then((response) => {
        console.log(response);
      });
  }, [ post ]);

  useEffect(() => {
    get('api/1/my/timeline')
      .then(setTimeline);
  }, [ ]);
  useEffect(() => {
    window.fetch('http://localhost:9000/api/1/explore')
      .then((res) => res.json())
      .then(setExploreData);
  }, []);

  return (
    <Container {...props}>
      <h1>
        {window.location.host}
      </h1>
      <TimelineContainer>
        <NewPostPanel />
        {timeline?.map((item) => (
          <PostCard
            key={item.link}
            post={item}
          />
        ))}
      </TimelineContainer>
      <ConnectContainer>
        <h2>Connect</h2>
        <input type="text" id="connectHost" />
        <button onClick={onClickConnect} type="button">go!</button>
      </ConnectContainer>
      <ExploreContainer>
        <h2>Explore</h2>
        <h3>Topics</h3>
        {!exploreData.topics.length && (
          <div>no topics found right now</div>
        )}
        {exploreData.topics.map((topic) => (
          <div key={topic}>
            <a href={`http://localhost:9000/topics/${topic}`}>
              {`#${topic}`}
            </a>
          </div>
        ))}
        <h3>Users</h3>
        {!exploreData.users.length && (
          <div>no users found right now</div>
        )}
      </ExploreContainer>
    </Container>
  )
};

export default App;
