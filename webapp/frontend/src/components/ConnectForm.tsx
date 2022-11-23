import {
  type ChildComponent,
  type FormSubmitEvent,
  useCallback
} from 'react';
import styled from 'styled-components';

import {
  useRemoteAction
} from '../hooks/useRemoteData';
import Button from './Button';
import Input from './Input';

interface ConnectFormShape {
  name: HTMLInputElement;
}

interface ConnectRequest {
  host: string;
}

interface ConnectResponse {
  ok: boolean;
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
  } = useRemoteAction<ConnectResponse, ConnectRequest>('/api/1/my/connect');
  const onSubmit = useCallback(async (e: FormSubmitEvent<ConnectFormShape>) => {
    e.preventDefault();
    const payload = {
      host: e.currentTarget.elements.name.value
    };
    const response = await execute(payload);

    console.log(response);
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
      <Button type="submit">ok!</Button>
    </ConnectFormContainer>
  );
};

export default ConnectForm;
