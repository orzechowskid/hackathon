import {
  type ChildComponent,
  type FormSubmitEvent,
  useCallback
} from 'react';
import styled from 'styled-components';

import {
  useConnect
} from '../hooks/useConnect';
import Button from './Button';
import Input from './Input';

interface ConnectFormShape {
  name: HTMLInputElement;
}

const ConnectFormContainer = styled.form`
  display: flex;
  flex-direction: column;

  & > button {
    align-self: flex-end;
  }
`;

const ConnectForm: ChildComponent = (props) => {
  const {
    execute
  } = useConnect();
  const onSubmit = useCallback(async (e: FormSubmitEvent<ConnectFormShape>) => {
    e.preventDefault();
    const payload = {
      host: e.currentTarget.elements.name.value
    };
    const response = await execute(payload);
  }, []);

  return (
    <ConnectFormContainer onSubmit={onSubmit}>
      <Input
        label="Search for other users or sites"
        id="name"
        placeholder="danorz"
        required
        type="text"
      />
      <Button
        type="submit"
        variant="secondary"
      >
        ok!
      </Button>
    </ConnectFormContainer>
  );
};

export default ConnectForm;
