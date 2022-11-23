import {
  type ChildComponent
} from 'react';
import styled from 'styled-components';

import alewifeLogo from '/alewife.svg';

const Logo: ChildComponent = (props) => {
  return (
    <a
      {...props}
      href="/"
    >
      <img
        alt="Alewife"
        src={alewifeLogo}
      />
    </a>
  );
};

export default styled(Logo)`
  display: block;

  img {
    width: 100%;
  }
`;
