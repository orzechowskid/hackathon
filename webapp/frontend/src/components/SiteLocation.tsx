import {
  type ChildComponent
} from 'react';
import styled from 'styled-components';

const SiteLocation: ChildComponent = (props) => {
  return (
    <div {...props}>
      {window.location.host}
    </div>
  );
};

export default styled(SiteLocation)``;
