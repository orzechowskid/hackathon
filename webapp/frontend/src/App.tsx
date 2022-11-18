import {
  Outlet
} from 'react-router';
import styled from 'styled-components';

import alewifeLogo from '/alewife.svg';

import ConnectForm from './components/ConnectForm';
import {
  PageTitle
} from './components/Heading';
import NewPostPanel from './components/NewPostPanel';
import QR from './components/QR';
import {
  useIdentity
} from './hooks/useIdentity';
import {
  useRemoteData
} from './hooks/useRemoteData';

interface ExploreDTO {
  topics: string[];
  users: string[];
}

const StyledQR = styled(QR)`
  width: 64px;
  height: 64px;
`;

const TitleTextContainer = styled.div`
  div:first-child {
    font-size: 24px;
    font-weight: bold;
  }

  div:last-child {
    font-size: 14px;
    font-style: italic;
  }
`;

const SidebarContainer = styled.div`
`;

const NewPostContainer = styled(NewPostPanel)``;

const AppContainer = styled.div`
  flex-grow: 1;
  display: grid;
  grid-template-rows: max-content max-content 1fr;
  grid-template-columns: 25vw 1fr;
  grid-gap: 24px;
  padding: 24px;
  background-color: var(--color-gray-800);

  ${TitleTextContainer} {
    grid-row: 1;
    grid-column: 2;
  }
  
  > a:has(img) {
    grid-row: 1;
    grid-column: 1;

    img {
      width: 80px;
    }
  }

  ${SidebarContainer} {
    grid-row: 2 / span 2;
    grid-column: 1;
  }

  ${NewPostContainer} {
    grid-row: 2;
    grid-column: 2;
  }
`;

const Logo = () => {
  return (
    <a href="/">
      <img
        alt="Alewife"
        src={alewifeLogo}
      />
    </a>
  );
};

const TitleText = () => {
  const {
    user
  } = useIdentity();
  return (
    <TitleTextContainer>
      <PageTitle>
        {user ? user.username : ''}
      </PageTitle>
      <div>{window.location.hostname}</div>
    </TitleTextContainer>
  );
};

const ExploreForm = () => {
  const {
    data,
    error
  } = useRemoteData<ExploreDTO>('/api/1/my/explore');

  return (
    <section>
      {error && (
        <span>something went wrong, please try again later.</span>
      )}
      <h2>Explore</h2>
      <section>
        <h3>
          Topics
        </h3>
        <ul>
          {data?.topics.map((topic) => (
            <li key={topic}>
              {`#${topic}`}
            </li>
          )) ?? <li>No topics to see right now</li>}
        </ul>
      </section>
      <section>
        <h3>
          Users
        </h3>
        <ul>
          {data?.users.map((user) => (
            <li key={user}>
              {user}
            </li>
          )) ?? <li>No users to see right now</li>}
        </ul>
      </section>
    </section>
  );
};

const Sidebar = () => {
  return (
    <SidebarContainer>
      <section>
        <h2>
          Connect
        </h2>
        <ConnectForm />
      </section>
      <section>
        <h2>
          Share
        </h2>
        <StyledQR value={window.location.host} />
      </section>
      <ExploreForm />
    </SidebarContainer>
  );
};

const App = () => {
  return (
    <AppContainer>
      <Logo />
      <TitleText />
      <Sidebar />
      <NewPostPanel />
      <Outlet />
    </AppContainer>
  );
};

export default App;
