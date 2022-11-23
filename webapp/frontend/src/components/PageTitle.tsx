import {
  type ChildComponent
} from 'react';
import styled from 'styled-components';
import { useIdentity } from '../hooks/useIdentity';

import Heading from './Heading';

const PageTitleContainer = styled.div`
  div {
    font-style: italic;
  }
`;

const PageTitle: ChildComponent = (props) => {
  const {
    user
  } = useIdentity();
  const name = user ? user.username : null;

  return (
    <PageTitleContainer {...props}>
      <Heading>
        {name}
      </Heading>
      <div>
        {window.location.host}
      </div>
    </PageTitleContainer>
  );
};

export default styled(PageTitle)``;
