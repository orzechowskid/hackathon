import {
  type ChildComponent
} from 'react';
import styled from 'styled-components';

import {
  useExplore
} from '../hooks/useExplore';
import ConnectForm from './ConnectForm';
import QR from './QR';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ExploreForm = () => {
  const {
    data,
    error
  } = useExplore();

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

const Sidebar: ChildComponent = (props) => {
  return (
    <SidebarContainer {...props}>
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
        <QR
          size={120}
          value={window.location.href}
        />
      </section>
      <ExploreForm />
    </SidebarContainer>
  );
};

export default styled(Sidebar)``;
