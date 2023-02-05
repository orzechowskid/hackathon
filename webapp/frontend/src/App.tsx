import {
  ButtonGroup
} from '@adobe/react-spectrum';
import {
  type ChildComponent,
  useCallback
} from 'react';
import {
  Outlet
} from 'react-router';
import styled from 'styled-components';

import Logo from './components/Logo';
import NewPostPanel from './components/NewPostPanel';
import PageTitle from './components/PageTitle';
import Sidebar from './components/Sidebar';
import SiteLocation from './components/SiteLocation';
import Timeline from './components/Timeline';

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

const ControlsContainer: ChildComponent = () => {
  return (
    <ButtonGroup orientation="horizontal">
      <NewPostPanel />
    </ButtonGroup>
  );
};

const AppContainer = styled.div`
  height: 100vh;
  display: grid;
  grid-gap: 24px;
  grid-template-columns: 24px 1fr;
  grid-template-rows: max-content 1fr 96px;

  ${Logo} {
    grid-row: 1;
    grid-column: 1;
    width: 24px;
    height: 24px;
  }

  ${PageTitle} {
    grid-row: 1;
    grid-column: 2;
  }
  
  ${SiteLocation} {
    display: none;
  }

  ${Sidebar} {
    grid-row: 3;
    grid-column: 1 / span 2;
    align-self: normal;
    overflow-y: auto;
  }

  ${Timeline} {
    grid-row: 2;
    grid-column: 1 / span 2;
    align-self: normal;
  }

  ${TitleTextContainer} {
    grid-row: 1;
    grid-column: 2;
  }

  @media (min-width: 800px) {
    grid-template-columns: max-content 1fr;
    grid-template-rows: min-content min-content 1fr;

    ${Logo} {
      width: 80px;
      height: 80px;
      margin-left: 16px;
      align-self: end;
    }

    ${PageTitle} {
      display: block;
      grid-row: 1;
      grid-column: 2;
      align-self: center;
    }

    ${Sidebar} {
      width: 240px;
      grid-row: 2 / span 2;
      grid-column: 1;
    }

    main {
      grid-row: 3;
      grid-column: 2;
    }
  }
`;

const App = () => {
  return (
    <AppContainer>
      <Logo />
      <PageTitle />
      <ControlsContainer />
      <main>
        <Outlet />
      </main>
      <Sidebar />
    </AppContainer>
  );
};

export default App;
