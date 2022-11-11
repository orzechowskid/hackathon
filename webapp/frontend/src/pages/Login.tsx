import {
  type FormSubmitEvent,
  type PageComponent,
  useCallback,
  useState
} from 'react';
import {
  useNavigate
} from 'react-router';
import styled from 'styled-components';

import Input from '../components/Input';
import {
  useIdentity
} from '../hooks/useIdentity';

interface LoginPanelShape {
  password: HTMLInputElement;
  username: HTMLInputElement;
}

const Login: PageComponent = () => {
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
    <form onSubmit={onSubmit}>
      <Input id="username" type="text" />
      <Input id="password" type="password" />
      <button type="submit">
        Log in
      </button>
      <div aria-live="polite">
        &#8203;{error}
      </div>
    </form>
  );
};

export default Login;
