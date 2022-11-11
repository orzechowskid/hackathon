import {
  type FormSubmitEvent,
  type PageComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  useNavigate
} from 'react-router';
import styled from 'styled-components';

import App from '../App';
import {
  useIdentity
} from '../hooks/useIdentity';

const LoginForm = styled.form`
  label {
    display: block;
  }

  [aria-live] {
    margin-top: 16px;
  }
`;

const StyledApp = styled(App)``;

const Container = styled.div`
  display: flex;
  justify-content: center;

  ${StyledApp} {
    flex-grow: 1;
  }
`;

interface LoginPanelShape {
  password: HTMLInputElement;
  username: HTMLInputElement;
}

const LoginPanel = () => {
  const {
    login
  } = useIdentity();
  const navigate = useNavigate();
  const [ error, setError ] = useState<string|undefined>();
  const onSubmit = useCallback(async (e: FormSubmitEvent<LoginPanelShape>) => {
    e.preventDefault();
    const {
      password,
      username
    } = e.currentTarget.elements;

    try {
      await login(username.value, password.value);
      navigate('/');
    }
    catch (ex: any) {
      setError(ex?.message ?? String(ex) ?? 'error');
    }
  }, []);

  return (
    <LoginForm onSubmit={onSubmit}>
      <label>
        <div>
          Username
        </div>
        <input id="username" type="text" />
      </label>
      <label>
        <div>
          Password
        </div>
        <input id="password" type="password" />
      </label>
      <button type="submit">
        Log in
      </button>
      <div aria-live="polite">
        &#8203;{error}
      </div>
    </LoginForm>
  );
};

const Index: PageComponent = () => {
  const {
    restore,
    user
  } = useIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === false) {
      navigate('/public');
    }
  }, [ user ]);

  useEffect(() => {
    restore();
  }, [ restore ]);

  return (
    user ? <App /> : null
  );
};

export default Index;
